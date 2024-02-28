import http from "http";
import https from "https";
import fs from "fs";
import sharp from "sharp";
import slugify from "slugify";
import { pathToFileURL } from "node:url";

export default class PodcastProcesser {
  constructor(url) {
    this.url = url;
  }

  processPodcast = async (podcast) => {
    const { audio, image } = await this.dataToDownload(podcast);

    await this.downloadData(audio.media, audio.destinationPath);
    await this.downloadData(image.media, image.destinationPath);

    this.resizeImage(this.getServerFilePath(image.destinationPath));
  };

  /**
   * Récupère l'ensemble des données permettant le téléchargement du podcast
   *
   * @param {String} podcast
   * @returns {Object}
   */
  dataToDownload = async (podcast) => {
    const title = this.getTitle(podcast);

    const audio = await this.audioDataToDownload(podcast, title);
    const image = await this.imageDataToDownload(podcast, title);

    return { audio, image };
  };

  /**
   * Construit un objet contenant toutes les informations nécessaires
   * pour le téléchargement de l'audio
   *
   * @param {Object} podcast
   * @param {String} title
   * @returns {Object}
   */
  audioDataToDownload = async (podcast, title) => {
    const media = await this.getAudioMedia(podcast);
    const destinationPath = this.getDestinationPathFromMediaUrl(media, title);

    return { media, destinationPath };
  };

  /**
   * Construit un objet contenant toutes les informations nécessaires
   * pour le téléchargement de l'image
   *
   * @param {Object} podcast
   * @param {String} title
   * @returns {Object}
   */
  imageDataToDownload = async (podcast, title) => {
    const media = await this.getImageMedia(podcast);
    const destinationPath = this.getDestinationPathFromMediaUrl(media, title);

    return { media, destinationPath };
  };

  /**
   * Download un fichier à partir d'une URL vers un dossier cible
   *
   * @param {URL} resource
   * @param {String} destination
   * @returns {Promise}
   */
  downloadData = (resource, destination) => {
    const file = fs.createWriteStream(destination);
    const protocole = this.getProtocole(resource);

    return new Promise((resolve) => {
      protocole
        .get(resource, function (response) {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  };

  /**
   * Crawl l'url afin de récupérer le contenu HTML
   *
   * @param {URL} url
   * @returns {String}
   */
  getPageContent = (url) => {
    return new Promise((resolve, reject) => {
      const protocole = this.getProtocole(url);

      protocole
        .get(url, (resp) => {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {
            resolve(data);
          });
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  };

  /**
   * Détermine le protocole à utiliser en fonction du protocole d'une url
   *
   * @param {String} url
   * @returns http | https
   */
  getProtocole = (url) => {
    return new URL(url).protocol.includes("https") ? https : http;
  };

  /**
   * Retourne le chemin complet sur le server d'un fichier
   *
   * @param {String} relativePath
   * @returns {String}
   */
  getServerFilePath = (relativePath) => {
    return pathToFileURL(relativePath).pathname;
  };

  /**
   *
   * @param {String} pageData
   * @param {String} filename
   * @returns {String}
   */
  getDestinationPath = (title, filename) => {
    const folderName =
      "data/" +
      slugify(title, {
        replacement: "-", // replace spaces with replacement character, defaults to `-`
        lower: true, // convert to lower case, defaults to `false`
        strict: true, // strip special characters except replacement, defaults to `false`
        locale: "vi", // language code of the locale to use
        trim: true, // trim leading and trailing replacement chars, defaults to `true`
      });

    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName, { recursive: true });
      }
    } catch (err) {
      console.error(err);
    }

    return `${folderName}/${filename}`;
  };

  /**
   * Construit le chemin de destination à partir de l'url du média
   * @param {String} media
   * @returns {String}
   */
  getDestinationPathFromMediaUrl = (media, title) => {
    const filename = media?.split("/").slice(-1)[0];

    return filename ? this.getDestinationPath(title, filename) : undefined;
  };

  /**
   * Redimensionne une image et la converti au format png
   *
   * @param {String} path
   */
  resizeImage = (path) => {
    sharp(path).resize(320, 240).toFormat("png").toFile(`${path}.png`);
  };
}
