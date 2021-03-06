const parser = require("bibtex-parse-js");
const weatherwax = require("./modules/weatherwax.js");
const banana = require("./modules/banana.js");
const abbreviationChecker = require("./modules/abbreviationChecker.js");
const conformityChecker = require("./modules/conformityChecker.js");
const spellChecker = require("./modules/spellChecker.js");

module.exports = {
  conformanceCodes: conformityChecker.conformanceCodes,

  createCallback: function(parsedBibtex, i, keepEntries) {
    return function(res) {
      if (Object.keys(res).length > 0 || keepEntries) {
        parsedBibtex.entries[i].orangutan = res;
        delete parsedBibtex.entries[i].config;
      } else {
        parsedBibtex.entries.splice(i, 1);
      }
    };
  },

  doParsing: function(entry, strings, callback) {
    var orangutan = {};

    if (entry.entryTags.optanalyze) {
      if (entry.config.ok) {
        callback(orangutan);
        return;
      }
    }

    const granny = weatherwax(function() {
      callback(orangutan);
    });

    const orangutanCallback = function() {
      return granny(function(result) {
        banana.mergeInto(result, orangutan);
      });
    };

    spellChecker.checkSpelling(entry, strings, orangutanCallback());
    conformityChecker.checkConformity(entry, orangutanCallback());
    abbreviationChecker.checkAbbreviations(entry, strings, false, orangutanCallback());

    granny.run();
  },

  parse: function(bibtex) {
    var callback, keepEntries;
    if (arguments.length < 2) {
      throw new RangeError("Too few arguments given, should at least be a string" +
                           " with bibtex and a callback");
    } else if (arguments.length === 2) {
      keepEntries = true;
      callback = arguments[1];
    } else if (arguments.length === 3) {
      keepEntries = arguments[1];
      callback = arguments[2];
    } else {
      throw new RangeError("Too many arguments given, should at most be a string with" +
                           " bibtex, if it should keep the entries and a callback");
    }

    try {
      var parsedBibtex = parser.toJSON(bibtex);

      const granny = weatherwax(function() {
        if (parsedBibtex.entries.length > 0) {
          if (!keepEntries)
            delete parsedBibtex["strings"];

          callback(parsedBibtex);
        } else {
          callback(false);
        }
      });
      granny.setOrdered(true);

      for (var i=parsedBibtex.entries.length-1; i>-1; i--) {
        var entry = parsedBibtex.entries[i];
        if (entry.entryTags.optanalyze) {
          var optorangutan = parsedBibtex.strings.toString(entry.entryTags.optanalyze);
          entry.config = banana.parseConfig(optorangutan);
        } else {
          entry.config = {};
        }

        var entryCallback = granny(this.createCallback(parsedBibtex, i, keepEntries));
        this.doParsing(entry, parsedBibtex.strings, entryCallback);
      }

      granny.run();
    } catch(error) {
      console.error("Error parsing the BibTeX: " + error);
      if (error.stack)
        console.error(error.stack);
    }
  }
};
