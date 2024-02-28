import PodcastProcesser from "./PodcastProcesser.js";

/**
 * *** MUST IMPLEMENT ***
 *  @download()
 *  @getTitle(podcast)
 *  @getAudioMedia(podcast)
 *  @getImageMedia(podcast)
 */
export default class singlePodcastProcesser extends PodcastProcesser {
  /**
   * Récupère le podcast à partir de son URL
   * @param {URL} url
   */
  download = async () => {
    const podcast = await this.getPageContent(this.url);

    await this.processPodcast(podcast);

    console.log("Download Terminé");
  };

  /**
   * Récupère le titre à partir d'un podcast
   *
   * @param {Object} podcast
   * @returns {String}
   */
  getTitle = (podcast) => {
    return podcast.match(/"headline":"\\?"?([A-Za-z,\-\s]+)\\?"?/)[1];
  };

  /**
   * Récupère le chemin réel du fichier média audio à télécharger
   *
   * @param {Object} item
   * @returns {String}
   */
  getAudioMedia(podcast) {
    const audioRegex =
      /{"@type":"AudioObject","contentUrl":"([a-zA-Z_\/:.\-0-9]*)"/;

    return podcast.match(audioRegex)[1];
  }

  /**
   * Récupère le chemin réel du fichier média image à télécharger
   *
   * @param {Object} item
   * @returns {String}
   */
  getImageMedia(podcast) {
    const imageRegex = /{"@type":"ImageObject","url":"([a-zA-Z_\/:.\-0-9]*)"/;

    return podcast.match(imageRegex)[1];
  }
}
