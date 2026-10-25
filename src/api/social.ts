import { http } from 'cosey';

/** 一套标准 RESTful 资源的增删改查 */
function crud(resource: string) {
  return {
    list: (params?: any) => http.get(resource, { params }),
    details: (id: number) => http.get(`${resource}/${id}`),
    add: (data: any) => http.post(resource, data),
    update: (id: number, data: any) => http.patch(`${resource}/${id}`, data),
    remove: (id: number) => http.delete(`${resource}/${id}`),
  };
}

const topics = crud('/social/topics');
const moments = crud('/social/moments');
const medals = crud('/social/medals');
const props = crud('/social/props');
const gifts = crud('/social/gifts');
const guilds = crud('/social/guilds');
const finances = crud('/social/finances');
const vips = crud('/social/vips');

export default {
  getTopics: topics.list,
  addTopic: topics.add,
  updateTopic: topics.update,
  deleteTopic: topics.remove,

  getMoments: moments.list,
  addMoment: moments.add,
  updateMoment: moments.update,
  deleteMoment: moments.remove,

  getMedals: medals.list,
  addMedal: medals.add,
  updateMedal: medals.update,
  deleteMedal: medals.remove,

  getProps: props.list,
  addProp: props.add,
  updateProp: props.update,
  deleteProp: props.remove,

  getGifts: gifts.list,
  addGift: gifts.add,
  updateGift: gifts.update,
  deleteGift: gifts.remove,

  getGuilds: guilds.list,
  addGuild: guilds.add,
  updateGuild: guilds.update,
  deleteGuild: guilds.remove,

  getFinances: finances.list,
  addFinance: finances.add,
  updateFinance: finances.update,
  deleteFinance: finances.remove,

  getVips: vips.list,
  addVip: vips.add,
  updateVip: vips.update,
  deleteVip: vips.remove,
};
