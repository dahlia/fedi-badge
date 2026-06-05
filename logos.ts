import akkoma from "./logos/akkoma.svg";
import bonfire from "./logos/bonfire.svg";
import calckey from "./logos/calckey.svg";
import fediverse from "./logos/__fediverse__.svg";
import friendica from "./logos/friendica.svg";
import gnusocial from "./logos/gnusocial.svg";
import hackerspub from "./logos/hackerspub.svg";
import hollo from "./logos/hollo.svg";
import kmyblue from "./logos/kmyblue.svg";
import lemmy from "./logos/lemmy.svg";
import loops from "./logos/loops.svg";
import mastodon from "./logos/mastodon.svg";
import mbin from "./logos/mbin.svg";
import misskey from "./logos/misskey.svg";
import mitra from "./logos/mitra.svg";
import peertube from "./logos/peertube.svg";
import pixelfed from "./logos/pixelfed.svg";
import pleroma from "./logos/pleroma.svg";
import sharky from "./logos/sharky.svg";
import threads from "./logos/threads.svg";

export const LOGOS: Record<string, string> = {
  akkoma,
  bonfire,
  calckey,
  friendica,
  "gnu-social": gnusocial,
  gnusocial,
  hackerspub,
  hollo,
  kmyblue,
  lemmy,
  loops,
  mastodon,
  mbin,
  misskey,
  mitra,
  peertube,
  pixelfed,
  pleroma,
  sharky,
  threads,
};

export const FALLBACK_LOGO: string = fediverse;

export function getLogo(softwareName: string): string {
  return LOGOS[softwareName.toLowerCase()] ?? FALLBACK_LOGO;
}
