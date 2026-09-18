import { defineComponent, ref } from 'vue';
import { type VideoCardExpose, videoCardProps, videoCardEmits } from './video-card.api';
import { useLockscreen } from 'element-plus';
import VideoViewer from '../video-viewer';
import { Icon } from '../icon';
import { createBem } from '../../utils';
import { RtiPlayCircleOutline } from 'richtext-icons';

export default defineComponent({
  name: 'CoVideoCard',
  inheritAttrs: false,
  props: videoCardProps,
  emits: videoCardEmits,
  setup(props, { emit, attrs, expose }) {
    const bem = createBem('video-card');

    const viewerVisible = ref(false);

    useLockscreen(viewerVisible);

    const openViewer = () => {
      viewerVisible.value = true;
      emit('open');
    };

    function closeViewer() {
      viewerVisible.value = false;
      emit('close');
    }

    expose<VideoCardExpose>({
      view() {
        openViewer();
      },
    });

    return () => {
      return (
        <>
          <div
            {...attrs}
            class={[bem.b(), bem.is(props.size)]}
            title={props.title || props.src}
            onClick={openViewer}
          >
            <video src={props.src} class={bem.e('video')} />
            <div class={bem.e('play-mask')}>
              <Icon class={bem.e('play-icon')}>
                <RtiPlayCircleOutline />
              </Icon>
            </div>
          </div>

          {viewerVisible.value && <VideoViewer src={props.src} onClose={closeViewer} />}
        </>
      );
    };
  },
});
