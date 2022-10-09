# Sacha
*TL;DR A web/improved version of [anitomy](https://github.com/erengy/anitomy)*

Sacha is a media string parser and more, for filenames, torrent names, or any sort of strings that represent a media name/metadata through a string and formats everything neatly for you.



## Anime relations
This library make use of Taiga's https://github.com/erengy/anime-relations list
to try and infer as accurate episode number as possible.

## Examples:

Sacha can parse all sorts of formats:
```
[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]
Cyberpunk.Edgerunners.S01.1080p.NF.WEB-DL.DDP5.1.DV.HDR.H.265.HUN.JPN.ENG-VARYG (DUAL, Multi-sub)
Ni Zhenshi Ge Tiancai - 15 - 1080p WEB H.264 -NanDesuKa (B-Global).mkv
Initial D - Third Stage (High Quality) MKV [1080p] Blu-Ray Rip (Stabilized V2)
[Erai-raws] Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e S2 - 02 [480p][Multiple Subtitle][5F5B5979].mkv
```


```ts
const result = parse('[Erai-raws] Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e S2 - 12 [1080p][HEVC][Multiple Subtitle] [ENG][POR-BR][SPA-LA][SPA][ARA][FRE][GER][ITA]')
expect(result, {
  group: 'Erai-raws',
  title: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e',
  season: 2,
  episode: 12,
  resolution: '1080p',
  videoCodec: 'HEVC',
  subtitleTerms: ['Multiple Subtitle'],
  subtitleLanguages: ['ENG', 'POR-BR', 'SPA-LA', 'SPA', 'ARA', 'FRE', 'GER', 'ITA']
})

const formattedResults = format(result)
expect(formattedResults, {
  /** Release group name */
  group: 'Erai-raws',
  /** Title of the media */
  title: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e',
  /** Season number */
  season: 2,
  /** Episode number */
  episode: 12,
  /** Common resolution, can be undefined as inferring doesn't make sense */
  resolution: Resolution.FHD, // 1080
  /** Common video codec, can be undefined */
  videoCodec: VideoCodec.H265, // 'H265'
  subtitleTerms: ['Multiple Subtitle'],
  subtitleLanguages: [
    LanguageTag.EN // 'en' ISO 639-2 Code for English
    LanguageTag.PT // 'pt' Code for Portuguese
    LanguageTag.ES // 'es' Code for Spanish
    LanguageTag.AR // 'ar' Code for Arabic
    LanguageTag.FR // 'fr' Code for French
    LanguageTag.DE // 'de' Code for German
    LanguageTag.IT // 'it' Code for Italian
  ]
})

const inferredResults = infer(result, { type: 'ANIME' })
expect(inferredResults, {
  group: 'Erai-raws',
  title: 'Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e',
  // ...
  /** Listed languages or inferred languages */
  audioLanguages: [
    LanguageTag.JA // 'ja' ISO 639-2 Code for Japanese
  ]
})
```

```ts
const result = parse('[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]')
expect(result, {
  group: 'silly',
  title: 'Cyberpunk Edgerunners',
  type: 'WEB-DL',
  resolution: '1080p',
  videoCodec: 'HEVC',
  audioCodec: 'E-AC-3',
  audioTerms: ['Dual-Audio']
})

const formattedResults = format(result)
expect(formattedResults, {
  group: 'silly',
  title: 'Cyberpunk Edgerunners',
  /** Type of release, Web, BlueRay, ect... */
  type: ReleaseType.WEB,
  resolution: Resolution.FHD,
  videoCodec: VideoCodec.H265, // 'H265'
  /** Common audio codec, can be undefined */
  audioCodec: AudioCodec.EAC3, // 'EAC3'
  /** Various audio terms that can help inferring languages, quality, ect... */
  audioTerms: ['Dual-Audio'],
})


const inferredResults = infer(result, { type: 'ANIME' })
expect(inferredResults, {
  group: 'silly',
  title: 'Cyberpunk Edgerunners',
  season: 1,
  /** Episode range describing how many episodes there is, if unknown infer Infinity */
  episodes: [1, Infinity],
  /** If a batch release, meaning if there is multiple files included in that (torrent/archive) file */
  batch: true,
  type: ReleaseType.WEB,
  resolution: Resolution.FHD,
  videoCodec: VideoCodec.H265,
  audioCodec: AudioCodec.EAC3,
  audioTerms: ['Dual-Audio'],
  audioLanguages: [
    LanguageTag.JA
    LanguageTag.EN
  ]
})
```

```ts
const result = parse('[MTBB] Made in Abyss S2 - The Golden City of the Scorching Sun - 04')
expect(result, {
  group: 'MTBB',
  title: 'Made in Abyss - The Golden City of the Scorching Sun',
  season: 'S2',
  episode: '04'
})

const formattedResults = format(result)
expect(formattedResults, {
  group: 'MTBB',
  title: 'Made in Abyss - The Golden City of the Scorching Sun',
  season: 2,
  episode: 4
})


const inferredResults = infer(result, { type: 'ANIME' })
expect(inferredResults, {
  group: 'MTBB',
  title: 'Made in Abyss - The Golden City of the Scorching Sun',
  season: 2,
  episode: 4,
  audioLanguages: [LanguageTag.JA]
})
```

### Todos:
- make a system that takes all terms, sort them by length, apply them, and re-categorize them back to prevent issues with small terms overriding longer ones
