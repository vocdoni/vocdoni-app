var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dash_video_element_exports = {};
__export(dash_video_element_exports, {
  default: () => dash_video_element_default
});
module.exports = __toCommonJS(dash_video_element_exports);
var import_custom_media_element = require("custom-media-element");
var import_media_tracks = require("media-tracks");
class DashVideoElement extends (0, import_media_tracks.MediaTracksMixin)(import_custom_media_element.CustomVideoElement) {
  static shadowRootOptions = { ...import_custom_media_element.CustomVideoElement.shadowRootOptions };
  static getTemplateHTML = (attrs) => {
    const { src, ...rest } = attrs;
    return import_custom_media_element.CustomVideoElement.getTemplateHTML(rest);
  };
  #apiInit;
  attributeChangedCallback(attrName, oldValue, newValue) {
    if (attrName !== "src") {
      super.attributeChangedCallback(attrName, oldValue, newValue);
    }
    if (attrName === "src" && oldValue != newValue) {
      this.load();
    }
  }
  async _initThumbnails(representation) {
    const generateAllCues = async (totalThumbnails2, thumbnailDuration2) => {
      const promises = [];
      const timescale = representation.timescale || 1;
      const startNumber = representation.startNumber || 1;
      const pto = representation.presentationTimeOffset ? representation.presentationTimeOffset / timescale : 0;
      const tduration = representation.segmentDuration;
      for (let thIndex = 0; thIndex < totalThumbnails2; thIndex++) {
        const startTime = calculateThumbnailStartTime({
          thIndex,
          thduration: thumbnailDuration2,
          ttiles: totalThumbnails2,
          tduration,
          startNumber,
          pto
        });
        const endTime = startTime + thumbnailDuration2;
        const promise = new Promise((resolve, reject) => {
          this.api.provideThumbnail(startTime, ({ url, width, height, x, y }) => {
            try {
              const cue = new VTTCue(
                startTime,
                endTime,
                `${url}#xywh=${x},${y},${width},${height}`
              );
              resolve(cue);
            } catch (err) {
              reject(err);
            }
          });
        });
        promises.push(promise);
      }
      return await Promise.all(promises).catch((e) => console.error("Error processing thumbnails", e));
    };
    const { totalThumbnails, thumbnailDuration } = calculateThumbnailTimes(representation);
    const cues = await generateAllCues(totalThumbnails, thumbnailDuration);
    let track = this.nativeEl.querySelector('track[label="thumbnails"]');
    if (!track) {
      track = createThumbnailTrack();
      this.nativeEl.appendChild(track);
      const vttUrl = cuesToVttBlobUrl(cues);
      track.src = vttUrl;
      track.dispatchEvent(new Event("change"));
    }
  }
  async load() {
    if (this.#apiInit) {
      this.api.attachSource(this.src);
      return;
    }
    this.#apiInit = true;
    const Dash = await import("dashjs");
    this.api = Dash.MediaPlayer().create();
    this.api.initialize(this.nativeEl, this.src, this.autoplay);
    this.api.on(Dash.MediaPlayer.events.STREAM_INITIALIZED, () => {
      const bitrateList = this.api.getRepresentationsByType("video");
      let videoTrack = this.videoTracks.getTrackById("main");
      if (!videoTrack) {
        videoTrack = this.addVideoTrack("main");
        videoTrack.id = "main";
        videoTrack.selected = true;
      }
      bitrateList.forEach((rep) => {
        const bitrate = rep.bandwidth ?? rep.bitrate ?? (Number.isFinite(rep.bitrateInKbit) ? rep.bitrateInKbit * 1e3 : void 0);
        const rendition = videoTrack.addRendition(rep.id, rep.width, rep.height, rep.mimeType ?? rep.codec, bitrate);
        rendition.id = rep.id;
      });
      this.videoRenditions.addEventListener("change", () => {
        const selected = this.videoRenditions[this.videoRenditions.selectedIndex];
        if (selected == null ? void 0 : selected.id) {
          this.api.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: false } } } });
          this.api.setRepresentationForTypeById("video", selected.id, true);
        } else {
          this.api.updateSettings({ streaming: { abr: { autoSwitchBitrate: { video: true } } } });
        }
      });
      if (!this.api.isDynamic()) {
        const imageReps = this.api.getRepresentationsByType("image");
        imageReps.forEach(async (rep, idx) => {
          if (idx > 0) return;
          this._initThumbnails(rep);
        });
      }
    });
  }
}
function calculateThumbnailTimes(representation) {
  var _a, _b;
  const essentialProp = representation.essentialProperties[0];
  const [htiles, vtiles] = essentialProp.value.split("x").map(Number);
  const ttiles = htiles * vtiles;
  const periodDuration = ((_b = (_a = representation.adaptation) == null ? void 0 : _a.period) == null ? void 0 : _b.duration) || null;
  const tileDuration = representation.segmentDuration;
  const timescale = representation.timescale || 1;
  const tduration = tileDuration / timescale;
  const thduration = tduration / ttiles;
  const totalThumbnails = periodDuration != null ? Math.ceil(periodDuration / thduration) : Math.ceil(tileDuration / thduration);
  return { totalThumbnails, thumbnailDuration: thduration };
}
function calculateThumbnailStartTime({ thIndex, tduration, thduration, ttiles, startNumber, pto }) {
  const tnumber = Math.floor(thIndex / ttiles) + startNumber;
  const thnumber = thIndex % ttiles + 1;
  const tileStartTime = (tnumber - 1) * tduration - pto;
  const thumbnailStartTime = (thnumber - 1) * thduration;
  return tileStartTime + thumbnailStartTime;
}
function createThumbnailTrack() {
  const track = document.createElement("track");
  track.kind = "metadata";
  track.label = "thumbnails";
  track.srclang = "en";
  track.mode = "hidden";
  track.default = true;
  return track;
}
function cuesToVttBlobUrl(cues) {
  let vtt = "WEBVTT\n\n";
  for (const cue of cues) {
    vtt += `${formatTime(cue.startTime)} --> ${formatTime(cue.endTime)}
`;
    vtt += `${cue.text}

`;
  }
  const blob = new Blob([vtt], { type: "text/vtt" });
  return URL.createObjectURL(blob);
  function formatTime(t) {
    const h = String(Math.floor(t / 3600)).padStart(2, "0");
    const m = String(Math.floor(t % 3600 / 60)).padStart(2, "0");
    const s = (t % 60).toFixed(3).padStart(6, "0");
    return `${h}:${m}:${s}`;
  }
}
if (globalThis.customElements && !globalThis.customElements.get("dash-video")) {
  globalThis.customElements.define("dash-video", DashVideoElement);
}
var dash_video_element_default = DashVideoElement;
