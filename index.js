import multiplePodcastProcesser from "./services/multiplePodcastProcesser.js";
import singlePodcastProcesser from "./services/singlePodcastProcesser.js";

// const singleUrl =
//   "https://www.radiofrance.fr/franceinter/podcasts/une-histoire-et-oli/idriss-et-le-secret-du-poulpe-par-simon-johannin-7041786";
// const singlePodcast = new singlePodcastProcesser(singleUrl);
// await singlePodcast.download();

const rss = "http://radiofrance-podcast.net/podcast09/rss_19721.xml";
const multiplePodcast = new multiplePodcastProcesser(rss);
await multiplePodcast.download();
