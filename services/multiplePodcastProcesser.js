import got from "got";
import { XMLParser } from "fast-xml-parser";
import PodcastProcesser from "./PodcastProcesser.js";
import readline from "readline";

/**
 * *** MUST IMPLEMENT ***
 *  @download()
 *  @getTitle(podcast)
 *  @getAudioMedia(podcast)
 *  @getImageMedia(podcast)
 */
export default class multiplePodcastProcesser extends PodcastProcesser {
  constructor(url) {
    super(url);

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.loadingString = "Loading...";
    this.loadingStringIncrement = ".";
  }
  /**
   * Permet de télécharger les données audio et image d'une page RSS
   *
   * @param {URL} url
   */
  download = async () => {
    const podcasts = await this.getPodcasts(this.url);

    for (let podcastIndex in podcasts) {
      this.displayLoader();
      await this.processPodcast(podcasts[podcastIndex]);
    }

    console.log("Download Terminé");
  };

  /**
   * Affiche une petite animation pour indiquer que le téléchargement est en cours
   */
  displayLoader() {
    this.rl.write(null, { ctrl: true, name: "u" });
    this.rl.write(this.loadingString);
    this.loadingString += this.loadingStringIncrement;
  }

  /**
   * Récupère la liste des podcast sur une url RSS
   *
   * @param {String} url
   * @returns {Array}
   */
  getPodcasts = async (url) => {
    const pageData = await this.getPageContent(url);
    const parser = new XMLParser({ ignoreAttributes: false });

    return parser.parse(pageData).rss.channel.item;
  };

  /**
   * Récupère le titre à partir d'un podcast
   *
   * @param {Object} podcast
   * @returns {String}
   */
  getTitle = (podcast) => {
    return podcast.title?.replaceAll('"', "").trim();
  };

  /**
   * Récupère le chemin réel du fichier média audio à télécharger
   * Il a fallu passer par la bibli 'got' pour résoudre la redirection
   * induite par le proxy
   *
   * @param {Object} item
   * @returns {String}
   */
  getAudioMedia = async (podcast) => {
    const audioProxy = podcast.enclosure
      ? podcast.enclosure["@_url"]
      : undefined;
    const res = await got(audioProxy);

    if (res.redirectUrls.length > 0) {
      const href = res.redirectUrls.map((url) => url.href)[0];
      const url = new URL(href);

      return `${url.origin}${url.pathname}`;
    }

    return audioProxy;
  };

  /**
   * Récupère le chemin réel du fichier média image à télécharger
   *
   * @param {Object} item
   * @returns {String}
   */
  getImageMedia = (podcast) => {
    return podcast["itunes:image"]
      ? podcast["itunes:image"]["@_href"]
      : undefined;
  };
}
