import { defineComponent, ref } from 'vue';
import { useLockscreen } from 'element-plus';
import { audioCardProps, audioCardEmits } from './audio-card.api';
import { Icon } from '../icon';
import { AudioViewer } from '../audio-viewer';
import { createBem } from '../../utils';
import { RtiVolumeUp } from 'richtext-icons';

export default defineComponent({
  name: 'CoAudioCard',
  inheritAttrs: false,
  props: audioCardProps,
  emits: audioCardEmits,
  setup(props, { attrs, emit, expose }) {
    const bem = createBem('audio-card');

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

    expose({
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
            onClick={() => openViewer()}
          >
            <Icon>
              <RtiVolumeUp />
            </Icon>
            <div class={bem.e('filename')}>{props.name}</div>
          </div>

          {viewerVisible.value && <AudioViewer src={props.src} onClose={() => closeViewer()} />}
        </>
      );
    };
  },
});
