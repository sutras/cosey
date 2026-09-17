import { ref } from 'vue';

/**
 * Global version bump on every ProseMirror transaction. Components that need to
 * react to selection/document changes can read this inside a computed.
 */
export const viewVersion = ref(0);

export function bumpViewVersion() {
  viewVersion.value++;
}
