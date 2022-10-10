export default [
  {
    "filename": "[silly] Cyberpunk Edgerunners (WEB-DL 1080p HEVC E-AC-3) [Dual-Audio]",
    "groups": ["silly"],
    "titles": ["Cyberpunk Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": "HEVC",
    "audioCodec": "E-AC-3",
    "audioTerms": ["Dual-Audio"],
    "typeTerms": ["WEB-DL"]
  },
  {
    "filename": "[DKB] Cyberpunk Edgerunners - Season 01 [1080p][HEVC x265 10bit][Dual-Audio][Multi-Subs][batch]",
    "groups": ["DKB"],
    "titles": ["Cyberpunk Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["HEVC", "x265"],
    "videoTerms": ["10bit"],
    "audioTerms": ["Dual-Audio"],
    "subtitleTerms:": ["Multi-Subs"],
    "seasonTerms": ["Season 01"],
    "batch": ["Season 01", "batch"]
  },
  {
    "filename": "[EMBER] Cyberpunk: Edgerunners (2022) (Season 1) [WEBRip] [1080p Dual Audio HEVC 10 bits] (Cyberpunk Edgerunners) (Batch)",
    "groups": ["EMBER"],
    "dates": ["2022"],
    "titles": ["Cyberpunk: Edgerunners"],
    "alias": ["Cyberpunk Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["HEVC"],
    "videoTerms": ["10 bits"],
    "audioTerms": ["Dual Audio"],
    "subtitleTerms:": ["Multi-Subs"],
    "seasonTerms": ["Season 1"],
    "batch": ["Season 1", "Batch"],
    "typeTerms": ["WEBRip"]
  },
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
  {
    "filename": "Cyberpunk - Edgerunners - S01v2 - MULTi 1080p WEB DV H.265 -NanDesuKa (NF)",
    "groups": ["-NanDesuKa"],
    "dates": ["2022"],
    "titles": ["Cyberpunk - Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["H.265"],
    "videoTerms": ["DV"],
    "audioLanguageTerms": ["MULTi"],
    "audioTerms": ["MULTi"],
    "subtitleLanguageTerms": ["MULTi"],
    "subtitleTerms:": ["MULTi"],
    "seasonTerms": ["S01"],
    "typeTerms": ["WEB"],
    "versionTerms": "v2",
    "sourceTerms": ["NF"]
  },
  {
    "filename": "[whomst] Cyberpunk: Edgerunners (subs only)",
    "groups": ["whomst"],
    "titles": ["Cyberpunk: Edgerunners"],
    "subtitleTerms:": ["subs"]
  },
  {
    "filename": "[Trix] Cyberpunk: Edgerunners (2022) [Optional Dual Audio] [Multi Subs] (1080p AV1)",
    "groups": ["Trix"],
    "dates": ["2022"],
    "titles": ["Cyberpunk: Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["AV1"],
    "audioLanguageTerms": ["Optional"],
    "audioTerms": ["Dual Audio"],
    "subtitleTerms:": ["Multi Subs"]
  },
  {
    "filename": "[Trix] Cyberpunk: Edgerunners (2022) [Optional Dual Audio] [Multi Subs] (720p AV1)",
    "groups": ["Trix"],
    "dates": ["2022"],
    "titles": ["Cyberpunk: Edgerunners"],
    "resolutionTerms": ["720p"],
    "videoCodecTerms": ["AV1"],
    "audioLanguageTerms": ["Optional"],
    "audioTerms": ["Dual Audio"],
    "subtitleTerms:": ["Multi Subs"]
  },
  {
    "filename": "[Anime Chap] Cyberpunk: Edgerunners - Season 1 [WEB 1080p] Improved Subs & Netflix Logos Removed (Episode 1 - 10) {Batch}",
    "groups": ["Anime Chap"],
    "titles": ["Cyberpunk: Edgerunners"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["AV1"],
    "audioLanguageTerms": ["Optional"],
    "audioTerms": ["Dual Audio"],
    "subtitleTerms:": ["Multi Subs"],
    "seasonTerms": ["Season 1"],
    "batch": ["Season 1", "Batch"],
    "typeTerms": ["WEB"]
  },
  {
    "filename": "Cyberpunk.Edgerunners.S01.1080p.NF.WEB-DL.DDP5.1.DV.HDR.H.265.HUN.JPN.ENG-VARYG (DUAL, Multi-sub)",
    "groups": ["-VARYG"],
    "titles": ["Cyberpunk.Edgerunners"],
    "audioCodecTerms": ["DDP5.1"],
    "resolutionTerms": ["1080p"],
    "videoCodecTerms": ["H.265"],
    "videoTerms": ["DV", "HDR"],
    "audioLanguageTerms": ["HUN", "JPN", "ENG"],
    "audioTerms": ["DUAL"],
    "subtitleLanguageTerms": ["Multi-sub"],
    "subtitleTerms:": ["Multi-sub"],
    "seasonTerms": ["S01"],
    "batch": ["S01", "Batch"],
    "typeTerms": ["WEB-DL"],
    "sourceTerms": ["NF"]
  }
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
  // @ts-ignore
  sourceTerms: undefined,
  // @ts-ignore
  seasonTerms: undefined,
  // @ts-ignore
  audioTerms: undefined,
  ...parserResult
}))
