export default [
  // {
  //   "filename": "[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]",
  //   "group": "silly",
  //   "title": "Cyberpunk Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": "HEVC",
  //   "audioCodec": "E-AC-3",
  //   "audioTerms": ["Dual-Audio"],
  //   "type": "WEB-DL"
  // },
  // {
  //   "filename": "[DKB] Cyberpunk Edgerunners - Season 01 [1080p][HEVC x265 10bit][Dual-Audio][Multi-Subs][batch]",
  //   "group": "DKB",
  //   "title": "Cyberpunk Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": ["HEVC", "x265"],
  //   "videoTerms": ["10bit"],
  //   "audioTerms": ["Dual-Audio"],
  //   "subtitleTerms:": ["Multi-Subs"],
  //   "season": "Season 01",
  //   "batch": ["Season 01", "batch"]
  // },
  // {
  //   "filename": "[EMBER] Cyberpunk: Edgerunners (2022) (Season 1) [WEBRip] [1080p Dual Audio HEVC 10 bits] (Cyberpunk Edgerunners) (Batch)",
  //   "group": "EMBER",
  //   "date": "2022",
  //   "title": "Cyberpunk: Edgerunners",
  //   "alias": ["Cyberpunk Edgerunners"],
  //   "resolution": "1080p",
  //   "videoCodec": ["HEVC"],
  //   "videoTerms": ["10 bits"],
  //   "audioTerms": ["Dual Audio"],
  //   "subtitleTerms:": ["Multi-Subs"],
  //   "season": "Season 1",
  //   "batch": ["Season 1", "Batch"],
  //   "type": "WEBRip"
  // },
  {
    "filename": "Cyberpunk Edgerunners WEB-DL 1080P HDR DV EAC3 VF VOSTFR-LTPD v2",
    "groups": ["-LTPD"],
    "titles": ["Cyberpunk Edgerunners"],
    "resolutionTerms": ["1080P"],
    "videoTerms": ["HDR", "DV"],
    "audioCodecTerms": ["EAC3"],
    "audioLanguageTerms": ["VF"],
    "subtitleLanguageTerms": ["VOSTFR"],
    "typeTerms": ["WEB-DL"],
    "versionTerms": ["v2"]
  },
  // {
  //   "filename": "Cyberpunk - Edgerunners - S01v2 - MULTi 1080p WEB DV H.265 -NanDesuKa (NF)",
  //   "group": "NanDesuKa",
  //   "date": "2022",
  //   "title": "Cyberpunk - Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": ["H.265"],
  //   "videoTerms": ["DV"],
  //   "audioLanguages": ["MULTi"],
  //   "audioTerms": ["MULTi"],
  //   "subtitleLanguages": ["MULTi"],
  //   "subtitleTerms:": ["MULTi"],
  //   "season": "S01",
  //   "type": "WEB",
  //   "version": "v2",
  //   "source": "NF"
  // },
  // {
  //   "filename": "[whomst] Cyberpunk: Edgerunners (subs only)",
  //   "group": "whomst",
  //   "title": "Cyberpunk: Edgerunners",
  //   "subtitleTerms:": ["subs"]
  // },
  // {
  //   "filename": "[Trix] Cyberpunk: Edgerunners (2022) [Optional Dual Audio] [Multi Subs] (1080p AV1)",
  //   "group": "Trix",
  //   "date": "2022",
  //   "title": "Cyberpunk: Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": ["AV1"],
  //   "audioLanguages": ["Optional"],
  //   "audioTerms": ["Dual Audio"],
  //   "subtitleTerms:": ["Multi Subs"]
  // },
  // {
  //   "filename": "[Trix] Cyberpunk: Edgerunners (2022) [Optional Dual Audio] [Multi Subs] (720p AV1)",
  //   "group": "Trix",
  //   "date": "2022",
  //   "title": "Cyberpunk: Edgerunners",
  //   "resolution": "720p",
  //   "videoCodec": ["AV1"],
  //   "audioLanguages": ["Optional"],
  //   "audioTerms": ["Dual Audio"],
  //   "subtitleTerms:": ["Multi Subs"]
  // },
  // {
  //   "filename": "[Anime Chap] Cyberpunk: Edgerunners - Season 1 [WEB 1080p] Improved Subs & Netflix Logos Removed (Episode 1 - 10) {Batch}",
  //   "group": "Anime Chap",
  //   "title": "Cyberpunk: Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": ["AV1"],
  //   "audioLanguages": ["Optional"],
  //   "audioTerms": ["Dual Audio"],
  //   "subtitleTerms:": ["Multi Subs"],
  //   "season": "Season 1",
  //   "batch": ["Season 1", "Batch"],
  //   "type": "WEB"
  // },
  // {
  //   "filename": "Cyberpunk.Edgerunners.S01.1080p.NF.WEB-DL.DDP5.1.DV.HDR.H.265.HUN.JPN.ENG-VARYG (DUAL, Multi-sub)",
  //   "group": "VARYG",
  //   "title": "Cyberpunk.Edgerunners",
  //   "resolution": "1080p",
  //   "videoCodec": ["H.265"],
  //   "videoTerms": ["DV", "HDR"],
  //   "audioLanguages": ["HUN", "JPN", "ENG"],
  //   "audioTerms": ["DUAL"],
  //   "subtitleLanguages": ["Multi-sub"],
  //   "subtitleTerms:": ["Multi-sub"],
  //   "season": "S01",
  //   "batch": ["S01", "Batch"],
  //   "type": "WEB-DL",
  //   "source": "NF"
  // }
].map(({ filename, ...parserResult }) => ({
  filename,
  // @ts-ignore
  titles: undefined,
  // @ts-ignore
  audioCodecTerms: undefined,
  // @ts-ignore
  audioLanguageTerms: undefined,
  // @ts-ignore
  dates: undefined,
  // @ts-ignore
  groups: undefined,
  // @ts-ignore
  versionTerms: undefined,
  // @ts-ignore
  resolutionTerms: undefined,
  // @ts-ignore
  subtitleTerms: undefined,
  ...parserResult
}))
