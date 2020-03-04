import { ServiceProvider } from '..';

interface PicartoUser {
  user_id: number;
  name: string;
  avatar: string;
  online: boolean;
  viewers: number;
  viewers_total: number;
  followers: number;
  subscribers: number;
  adult: boolean;
  category: string;
  account_type: string;
  commissions: boolean;
  recordings: boolean;
  title: string;
  private: boolean;
  private_message: string;
  gaming: boolean;
  last_live: string; // date timestamp owo
  tags: any[];
  multistream: any[];
  following: boolean;
  languages: {
    id: number;
    name: string | 'None';
  }[];
  chat_settings: {
    guest_chat: boolean;
    links: boolean;
    level: number;
  }
  description_panels: {
    title: string;
    body: string;
    image: string;
    image_link: string;
    button_link: string;
    position: number;
  }[];
  thumbnails: {
    web: string;
    web_large: string;
    mobile: string;
    tablet: string;
  };
}

export class PicartoTV extends ServiceProvider<PicartoUser | null> {
  constructor() {
    super('picarto', 30000);
  }

  async provide(username: string) {
    const res = await this.bot.http
      .get(`https://api.picarto.tv/v1/channels/name/${username}`)
      .execute();

    let resp!: PicartoUser | null;
    try {
      resp = res.json<PicartoUser>();
    }
    catch(ex) {
      const text = res.text();
      if (text === 'Account does not exist') resp = null;
      else resp = null;
    }

    return resp;
  }
}