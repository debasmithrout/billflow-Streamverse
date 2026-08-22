// src/config/devConfig.js

/**
 * Mappings of content IDs to local development video paths for playback verification.
 * These are only loaded in local development mode (import.meta.env.DEV === true).
 */
export const DEV_VIDEO_URLS = {
  jw4: "/uploads/movies/john-wick-4/1080p.mp4",
  "john-wick-4": "/uploads/movies/john-wick-4/1080p.mp4",
  opp: "/uploads/movies/oppenheimer/hls-test/master.m3u8",
  oppenheimer: "/uploads/movies/oppenheimer/hls-test/master.m3u8",
  movies_hero: "/uploads/movies/the-batman/1080p.mp4",
  cw3: "/uploads/movies/inception.mp4",
  t3: "/uploads/movies/dune-part-two/1080p.mp4",
  dune2: "/uploads/movies/dune-part-two/1080p.mp4",
  "dune-part-two": "/uploads/movies/dune-part-two/1080p.mp4",
  t5: "/uploads/movies/the-batman/1080p.mp4",
  "the-batman": "/uploads/movies/the-batman/1080p.mp4",
  b2: "/uploads/movies/dangal/1080p.mp4",
  dangal: "/uploads/movies/dangal/1080p.mp4",
};

export const DEV_VIDEO_SOURCES = {
  opp: [
    { quality: "1080p", url: "/uploads/movies/oppenheimer/hls-test/master.m3u8", type: "application/x-mpegURL" },
    { quality: "720p", url: "/uploads/movies/oppenheimer/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/oppenheimer/480p.mp4", type: "video/mp4" },
  ],
  oppenheimer: [
    { quality: "1080p", url: "/uploads/movies/oppenheimer/hls-test/master.m3u8", type: "application/x-mpegURL" },
    { quality: "720p", url: "/uploads/movies/oppenheimer/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/oppenheimer/480p.mp4", type: "video/mp4" },
  ],
  jw4: [
    { quality: "1080p", url: "/uploads/movies/john-wick-4/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/john-wick-4/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/john-wick-4/480p.mp4", type: "video/mp4" },
  ],
  "john-wick-4": [
    { quality: "1080p", url: "/uploads/movies/john-wick-4/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/john-wick-4/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/john-wick-4/480p.mp4", type: "video/mp4" },
  ],
  t3: [
    { quality: "1080p", url: "/uploads/movies/dune-part-two/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/dune-part-two/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/dune-part-two/480p.mp4", type: "video/mp4" },
  ],
  dune2: [
    { quality: "1080p", url: "/uploads/movies/dune-part-two/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/dune-part-two/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/dune-part-two/480p.mp4", type: "video/mp4" },
  ],
  "dune-part-two": [
    { quality: "1080p", url: "/uploads/movies/dune-part-two/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/dune-part-two/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/dune-part-two/480p.mp4", type: "video/mp4" },
  ],
  t5: [
    { quality: "1080p", url: "/uploads/movies/the-batman/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/the-batman/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/the-batman/480p.mp4", type: "video/mp4" },
  ],
  "the-batman": [
    { quality: "1080p", url: "/uploads/movies/the-batman/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/the-batman/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/the-batman/480p.mp4", type: "video/mp4" },
  ],
  b2: [
    { quality: "1080p", url: "/uploads/movies/dangal/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/dangal/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/dangal/480p.mp4", type: "video/mp4" },
  ],
  dangal: [
    { quality: "1080p", url: "/uploads/movies/dangal/1080p.mp4", type: "video/mp4" },
    { quality: "720p", url: "/uploads/movies/dangal/720p.mp4", type: "video/mp4" },
    { quality: "480p", url: "/uploads/movies/dangal/480p.mp4", type: "video/mp4" },
  ],
};

export const DEV_AUDIO_SOURCES = {
  opp: {
    Hindi: {
      "1080p": "/uploads/movies/oppenheimer/1080p-hindi.mp4",
      "720p": "/uploads/movies/oppenheimer/720p-hindi.mp4",
      "480p": "/uploads/movies/oppenheimer/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/oppenheimer/1080p-english.mp4",
      "720p": "/uploads/movies/oppenheimer/720p-english.mp4",
      "480p": "/uploads/movies/oppenheimer/480p-english.mp4"
    }
  },
  oppenheimer: {
    Hindi: {
      "1080p": "/uploads/movies/oppenheimer/1080p-hindi.mp4",
      "720p": "/uploads/movies/oppenheimer/720p-hindi.mp4",
      "480p": "/uploads/movies/oppenheimer/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/oppenheimer/1080p-english.mp4",
      "720p": "/uploads/movies/oppenheimer/720p-english.mp4",
      "480p": "/uploads/movies/oppenheimer/480p-english.mp4"
    }
  },
  "dune-part-two": {
    Hindi: {
      "1080p": "/uploads/movies/dune-part-two/1080p-hindi.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-hindi.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/dune-part-two/1080p-english.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-english.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-english.mp4"
    }
  },
  dune2: {
    Hindi: {
      "1080p": "/uploads/movies/dune-part-two/1080p-hindi.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-hindi.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/dune-part-two/1080p-english.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-english.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-english.mp4"
    }
  },
  t3: {
    Hindi: {
      "1080p": "/uploads/movies/dune-part-two/1080p-hindi.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-hindi.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/dune-part-two/1080p-english.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-english.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-english.mp4"
    }
  },
  top2: {
    Hindi: {
      "1080p": "/uploads/movies/dune-part-two/1080p-hindi.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-hindi.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/dune-part-two/1080p-english.mp4",
      "720p": "/uploads/movies/dune-part-two/720p-english.mp4",
      "480p": "/uploads/movies/dune-part-two/480p-english.mp4"
    }
  },
  "john-wick-4": {
    Hindi: {
      "1080p": "/uploads/movies/john-wick-4/1080p-hindi.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-hindi.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/john-wick-4/1080p-english.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-english.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-english.mp4"
    }
  },
  jw4: {
    Hindi: {
      "1080p": "/uploads/movies/john-wick-4/1080p-hindi.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-hindi.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/john-wick-4/1080p-english.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-english.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-english.mp4"
    }
  },
  t1: {
    Hindi: {
      "1080p": "/uploads/movies/john-wick-4/1080p-hindi.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-hindi.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/john-wick-4/1080p-english.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-english.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-english.mp4"
    }
  },
  a3: {
    Hindi: {
      "1080p": "/uploads/movies/john-wick-4/1080p-hindi.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-hindi.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/john-wick-4/1080p-english.mp4",
      "720p": "/uploads/movies/john-wick-4/720p-english.mp4",
      "480p": "/uploads/movies/john-wick-4/480p-english.mp4"
    }
  },
  "the-batman": {
    Hindi: {
      "1080p": "/uploads/movies/the-batman/1080p-hindi.mp4",
      "720p": "/uploads/movies/the-batman/720p-hindi.mp4",
      "480p": "/uploads/movies/the-batman/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/the-batman/1080p-english.mp4",
      "720p": "/uploads/movies/the-batman/720p-english.mp4",
      "480p": "/uploads/movies/the-batman/480p-english.mp4"
    }
  },
  t5: {
    Hindi: {
      "1080p": "/uploads/movies/the-batman/1080p-hindi.mp4",
      "720p": "/uploads/movies/the-batman/720p-hindi.mp4",
      "480p": "/uploads/movies/the-batman/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/the-batman/1080p-english.mp4",
      "720p": "/uploads/movies/the-batman/720p-english.mp4",
      "480p": "/uploads/movies/the-batman/480p-english.mp4"
    }
  },
  top5: {
    Hindi: {
      "1080p": "/uploads/movies/the-batman/1080p-hindi.mp4",
      "720p": "/uploads/movies/the-batman/720p-hindi.mp4",
      "480p": "/uploads/movies/the-batman/480p-hindi.mp4"
    },
    English: {
      "1080p": "/uploads/movies/the-batman/1080p-english.mp4",
      "720p": "/uploads/movies/the-batman/720p-english.mp4",
      "480p": "/uploads/movies/the-batman/480p-english.mp4"
    }
  }
};
