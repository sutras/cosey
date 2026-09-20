import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue';
import { ElPopover } from 'element-plus';
import { createBem } from '../../utils';
import { useLocale } from '../../hooks';
import { useEditor } from './pm/context';
import { useSelectionRect } from './hooks/useSelectionRect';
import ButtonGroup from './button-group';
import Button from './button';
import type { EditorButtonExpose } from './button';
import { Icon } from '../icon';
import FormatMark from './formats/format-mark';
import FormatColor from './formats/format-color';
import FormatBackground from './formats/format-background';
import FormatLink from './formats/format-link';
import FormatClear from './formats/format-clear';
import FormatFont from './formats/format-font';
import FormatSize from './formats/format-size';
import FormatIndent from './formats/format-indent';
import FormatSource from './formats/format-source';
import {
  RtiBold,
  RtiInlineCode,
  RtiIndentDecrease,
  RtiIndentIncrease,
  RtiItalic,
  RtiMoreHorizontal,
  RtiStrikethrough,
  RtiSubscript,
  RtiSuperscript,
  RtiUnderline,
} from 'richtext-icons';
import type { SelectionRect } from './hooks/useSelectionRect';
import ButtonGroupList from './button-group-list';
import FloatToolbar from './float-toolbar';

/** 选区上边中点放一个零尺寸的虚拟锚点，工具条贴在它上方。 */
function createVirtualRef(rect: SelectionRect) {
  const x = (rect.left + rect.right) / 2;
  const y = rect.top;
  return {
    getBoundingClientRect: () => ({
      x,
      y,
      top: y,
      left: x,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
      toJSON() {
        return this;
      },
    }),
  };
}

/**
 * 浮动「行内样式」工具条：选中文本后浮出，只包含作用于选中文本的行内样式
 * （加粗/斜体/下划线/删除线/行内代码/颜色/背景/链接/清除格式）。
 *
 * 末尾有一个「更多」按钮，点击弹出扩展面板，承载不常用的操作（上标/下标、字体、字号、
 * 缩进、撤销/重做、源码模式），保证浮动形态下也能用到固定工具栏的全部功能。
 *
 * 定位复用表格工具条的模式：ElPopover + virtual-ref，内容 teleport 到 body。
 * 选区每次变化都生成新的虚拟锚点对象，popper 检测到 reference 变化后会重新定位。
 * 工具条在「松开鼠标、选区定型」后才浮出（见 useSelectionRect），拖选过程不跟随移动。
 */
export default defineComponent({
  name: 'CoEditorFloatFormatToolbar',
  setup() {
    const bem = createBem('editor-float-toolbar');
    const { t } = useLocale();
    const editor = useEditor();

    const selectionRect = useSelectionRect();

    // 点击工具条之外时收起（点编辑器外面选区不会变、也不产生事务，得自己记一下）
    const dismissed = ref(false);
    // 「更多」扩展面板是否展开
    const moreVisible = ref(false);

    // 「更多」按钮：作为扩展面板（popover）的定位锚点
    const moreButtonRef = useTemplateRef<EditorButtonExpose>('moreButton');

    // 扩展面板的虚拟锚点：指向「更多」按钮，供 ElPopover 定位
    const moreAnchor = computed(() => {
      const el = moreButtonRef.value?.el;
      if (!el) return null;
      return {
        getBoundingClientRect: () => el.getBoundingClientRect(),
      };
    });

    const virtualRef = computed(() => {
      const rect = dismissed.value ? null : selectionRect.value;
      return rect ? createVirtualRef(rect) : null;
    });

    // 工具条收起时整个浮层会卸载，扩展面板的展开状态要一并重置，
    // 否则下次浮出时面板还挂着上次的展开状态
    watch(virtualRef, (anchor) => {
      if (!anchor) moreVisible.value = false;
    });

    // 选区移动到新位置（重新拖选、键盘扩选）说明用户发起了新的选择意图，
    // 之前「点编辑器外」导致的收起不再生效，工具条重新浮出
    watch(selectionRect, (rect, old) => {
      if (
        rect &&
        (!old || rect.top !== old.top || rect.left !== old.left || rect.right !== old.right)
      ) {
        dismissed.value = false;
      }
    });

    const isInsideToolbarUi = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;

      // 点编辑器内部不算 dismiss：双击选词时 mousedown 先于选区产生，
      // 这时不能把工具条收起来，否则选完词工具条出不来
      const editorRoot = editor.view.dom.closest('.co-editor');
      if (editorRoot?.contains(target)) return true;

      return !!target.closest(
        `.co-editor-float-toolbar, .co-editor-picker, .co-editor-color-picker, .el-dialog, .${bem.e('more')}`,
      );
    };

    const onDocumentMousedown = (event: MouseEvent) => {
      const inside = isInsideToolbarUi(event.target);
      dismissed.value = !inside;

      // 点了工具条上的其他按钮时收起扩展面板；点面板内部或「更多」按钮本身除外
      if (moreVisible.value && inside && event.target instanceof Element) {
        if (!event.target.closest(`.${bem.e('more')}, .${bem.e('more-toggle')}`)) {
          moreVisible.value = false;
        }
      }
    };

    const toggleMore = () => {
      moreVisible.value = !moreVisible.value;
    };

    onMounted(() => {
      document.addEventListener('mousedown', onDocumentMousedown, true);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocumentMousedown, true);
    });

    return () => {
      const anchor = virtualRef.value;

      if (!anchor) return null;

      return (
        <ElPopover
          virtual-ref={anchor}
          virtual-triggering={true}
          visible={true}
          trigger="click"
          placement="top"
          show-arrow={false}
          offset={8}
          width="auto"
          popperStyle={{ padding: 0 }}
        >
          {{
            default: () => (
              <>
                <FloatToolbar>
                  <ButtonGroupList>
                    <ButtonGroup>
                      <FormatMark format="bold" icon={RtiBold} />
                      <FormatMark format="italic" icon={RtiItalic} />
                      <FormatMark format="underline" icon={RtiUnderline} />
                      <FormatMark format="strikethrough" icon={RtiStrikethrough} />
                      <FormatMark format="code" icon={RtiInlineCode} />
                      <FormatLink />
                    </ButtonGroup>
                    <ButtonGroup>
                      <FormatColor />
                      <FormatBackground />
                    </ButtonGroup>
                    <ButtonGroup>
                      <FormatClear />
                    </ButtonGroup>
                    <ButtonGroup>
                      {/* 更多操作入口：展开独立的扩展面板（ElPopover，挂在一级工具条上方）。
                      用受控 visible + virtual-ref 定位，避免 focus-trap 在焦点
                      落到面板外（如内嵌选择器的弹层）时把面板误关。 */}
                      <Button
                        ref="moreButton"
                        active={moreVisible.value}
                        class={bem.e('more-toggle')}
                        title={t('co.editor.more')}
                        onClick={toggleMore}
                      >
                        <Icon>
                          <RtiMoreHorizontal />
                        </Icon>
                      </Button>
                    </ButtonGroup>
                  </ButtonGroupList>
                </FloatToolbar>
                {moreVisible.value && moreAnchor.value && (
                  <ElPopover
                    virtual-ref={moreAnchor.value}
                    virtual-triggering={true}
                    visible={true}
                    trigger="click"
                    placement="top"
                    show-arrow={false}
                    offset={8}
                    width="auto"
                    popperClass={bem.e('more')}
                    popper-style={{ padding: 0 }}
                  >
                    {{
                      default: () => (
                        <FloatToolbar>
                          <ButtonGroup wrap={false}>
                            <FormatFont />
                            <FormatSize />
                            <FormatMark format="superscript" icon={RtiSuperscript} />
                            <FormatMark format="subscript" icon={RtiSubscript} />
                            <FormatIndent delta={-1} icon={RtiIndentDecrease} />
                            <FormatIndent delta={+1} icon={RtiIndentIncrease} />
                            <FormatSource />
                          </ButtonGroup>
                        </FloatToolbar>
                      ),
                    }}
                  </ElPopover>
                )}
              </>
            ),
          }}
        </ElPopover>
      );
    };
  },
});
