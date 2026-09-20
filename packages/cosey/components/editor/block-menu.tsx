import { computed, defineComponent, useTemplateRef } from 'vue';
import { ElPopover } from 'element-plus';
import { createBem } from '../../utils';
import { useLocale } from '../../hooks';
import { useBlockRect } from './hooks/useBlockRect';
import { useEditor } from './pm/context';
import {
  ContextMenu,
  ContextMenuItem,
  ContextSubMenu,
  type ContextMenuExpose,
} from '../context-menu';
import FormatImage from './formats/format-image';
import FormatVideo from './formats/format-video';
import FormatTable from './formats/format-table';
import FormatFormula from './formats/format-formula';
import {
  RtiAlignCenter,
  RtiAlignJustify,
  RtiAlignLeft,
  RtiAlignRight,
  RtiBulletList,
  RtiCodeBlock,
  RtiHeading1,
  RtiHeading2,
  RtiHeading3,
  RtiHeading4,
  RtiHeading5,
  RtiHeading6,
  RtiOrderedList,
  RtiParagraph,
  RtiPlus,
  RtiQuote,
} from 'richtext-icons';
import {
  HEADING_WITH_PARA_TYPES,
  type FormatAlign,
  type HeadingParagraphType,
  type ListType,
} from './types';
import type { BlockRect } from './hooks/useBlockRect';

/** 块级菜单项派发的命令：样式类操作全部走 command，由 onCommand 统一调 editor。 */
type BlockCommand =
  | { type: 'heading'; value: HeadingParagraphType }
  | { type: 'list'; value: ListType }
  | { type: 'align'; value: FormatAlign }
  | { type: 'blockQuote' }
  | { type: 'codeBlock' };

/** 块级元素左上角放一个零尺寸的虚拟锚点，入口按钮/菜单贴在它左侧、与块顶部对齐。
 *  用 top 而非垂直中点：长段落光标在上方时，入口按钮若钉在段落垂直中点会跑到很下面。 */
function createVirtualRef(rect: BlockRect) {
  const x = rect.left;
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
 * 浮动「块级菜单」：光标所在块级元素的左侧常驻一个「+」入口按钮，
 * 点击展开上下文菜单。菜单基于通用 `ContextMenu` 组件，通过子菜单折叠
 * 次要操作（标题层级、对齐方式、插入元素）。
 *
 * 样式类操作（标题/列表/对齐/引用/代码块）用 `ContextMenuItem` 的 `icon` 插槽 +
 * `title` + `command` 声明式表达，由 `onCommand` 统一派发到 editor，不再内嵌
 * formats/* 组件；只有插入类（图片/视频/表格/公式）因承载了弹窗/网格选择器，
 * 仍复用 Format 组件（配合 `close-on-select=false` 保持菜单不关闭）。
 */
export default defineComponent({
  name: 'CoEditorBlockMenu',
  setup() {
    const bem = createBem('editor-block-menu');
    const { t } = useLocale();
    const editor = useEditor();

    const blockRect = useBlockRect();

    const menuRef = useTemplateRef<ContextMenuExpose>('menu');

    const virtualRef = computed(() => {
      return blockRect.value ? createVirtualRef(blockRect.value) : null;
    });

    const openMenu = () => {
      menuRef.value?.open();
    };

    const closeMenu = () => {
      menuRef.value?.close();
    };

    const handleCommand = (command: BlockCommand) => {
      switch (command.type) {
        case 'heading':
          editor.formatHeading(command.value);
          break;
        case 'list':
          editor.formatList(command.value);
          break;
        case 'align':
          editor.formatAlign(command.value);
          break;
        case 'blockQuote':
          editor.formatBlockQuote();
          break;
        case 'codeBlock':
          editor.formatCodeBlock();
          break;
      }
    };

    return () => {
      const anchor = virtualRef.value;

      // 读取 editor.version 建立响应式依赖：块级状态变化（如切换列表/对齐）时
      // 重渲染，从而刷新各项的 active 高亮
      void editor.version.value;
      const activeHeading = editor.getActiveHeadingType();
      const activeList = editor.getListType();

      return (
        <>
          {/* 入口按钮：只要有块级锚点就常驻显示 */}
          {anchor && (
            <ElPopover
              virtual-ref={anchor}
              virtual-triggering={true}
              visible={true}
              trigger="click"
              placement="left-start"
              show-arrow={false}
              offset={4}
              width="auto"
              popperClass={[bem.b(), bem.e('entry-popper')]}
            >
              {{
                default: () => (
                  <button
                    type="button"
                    title={t('co.editor.blockMenu')}
                    class={bem.e('entry')}
                    onMousedown={(event) => event.preventDefault()}
                    onClick={openMenu}
                  >
                    <RtiPlus />
                  </button>
                ),
              }}
            </ElPopover>
          )}

          {/* 上下文菜单：弹在入口按钮右侧，多级折叠。
              persistent：菜单关闭仅隐藏，插入类操作打开的弹窗/网格不随菜单卸载 */}
          {anchor && (
            <ContextMenu
              ref="menu"
              trigger="manual"
              virtual-ref={anchor}
              placement="right-start"
              offset={8}
              persistent
              lock-scroll={false}
              onCommand={handleCommand}
            >
              {/* 标题：二级菜单（正文 + 标题 1~6），不再复用下拉列表 */}
              <ContextSubMenu
                title={t('co.editor.heading')}
                v-slots={{ icon: () => <RtiHeading1 /> }}
              >
                {HEADING_WITH_PARA_TYPES.map((type, index) => {
                  const label =
                    index === 0 ? t('co.editor.mainBody') : `${t('co.editor.leading')} ${index}`;
                  // 正文 + 标题 1~6 的左侧图标，与标题层级一一对应
                  const Icon = [
                    RtiParagraph,
                    RtiHeading1,
                    RtiHeading2,
                    RtiHeading3,
                    RtiHeading4,
                    RtiHeading5,
                    RtiHeading6,
                  ][index];
                  return (
                    <ContextMenuItem
                      key={type}
                      command={{ type: 'heading', value: type }}
                      title={label}
                      active={activeHeading === type}
                      v-slots={{ icon: () => <Icon /> }}
                    />
                  );
                })}
              </ContextSubMenu>

              {/* 有序 / 无序列表 */}
              <ContextMenuItem
                command={{ type: 'list', value: 'numbered-list' }}
                title={t('co.editor.orderedList')}
                active={activeList === 'numbered-list'}
                v-slots={{ icon: () => <RtiOrderedList /> }}
              />
              <ContextMenuItem
                command={{ type: 'list', value: 'bulleted-list' }}
                title={t('co.editor.bulletList')}
                active={activeList === 'bulleted-list'}
                v-slots={{ icon: () => <RtiBulletList /> }}
              />

              {/* 引用 / 代码块 */}
              <ContextMenuItem
                command={{ type: 'blockQuote' }}
                title={t('co.editor.blockQuote')}
                active={editor.isBlockQuoteActive()}
                v-slots={{ icon: () => <RtiQuote /> }}
              />
              <ContextMenuItem
                command={{ type: 'codeBlock' }}
                title={t('co.editor.codeBlock')}
                active={editor.isCodeBlockActive()}
                v-slots={{ icon: () => <RtiCodeBlock /> }}
              />

              {/* 子菜单：对齐方式 */}
              <ContextSubMenu
                title={t('co.editor.align')}
                v-slots={{ icon: () => <RtiAlignLeft /> }}
              >
                {(
                  [
                    ['left', RtiAlignLeft, t('co.editor.alignLeft')],
                    ['center', RtiAlignCenter, t('co.editor.alignCenter')],
                    ['right', RtiAlignRight, t('co.editor.alignRight')],
                    ['justify', RtiAlignJustify, t('co.editor.alignJustify')],
                  ] as const
                ).map(([value, AlignIcon, label]) => (
                  <ContextMenuItem
                    key={value}
                    command={{ type: 'align', value }}
                    title={label}
                    active={editor.isAlignActive(value)}
                    v-slots={{ icon: () => <AlignIcon /> }}
                  />
                ))}
              </ContextSubMenu>

              {/* 子菜单：插入元素。图片/视频/公式点击后即关闭菜单（弹窗独立挂 body）；
                  表格网格锚定菜单项，选定格子插入后才关闭菜单 */}
              <ContextSubMenu
                divided
                title={t('co.editor.insert')}
                v-slots={{ icon: () => <RtiPlus /> }}
              >
                <FormatImage embedded label={t('co.editor.image')} onTrigger={closeMenu} />
                <FormatVideo embedded label={t('co.editor.video')} onTrigger={closeMenu} />
                <FormatTable embedded label={t('co.editor.table')} onTrigger={closeMenu} />
                <FormatFormula embedded label={t('co.editor.formula')} onTrigger={closeMenu} />
              </ContextSubMenu>
            </ContextMenu>
          )}
        </>
      );
    };
  },
});
