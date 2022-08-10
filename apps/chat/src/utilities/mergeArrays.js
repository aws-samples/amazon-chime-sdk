// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/**
 * Merges two arrays of objects.
 * @param {[]} original Original array data.
 * @param {[]} newdata New array data to be appended to original
 * @param {string} uniqueSelector attribute key to select unique elements.
 */
const mergeArrayOfObjects = (original, newdata, uniqueSelector = '') => {
  newdata.forEach(dat => {
    var foundIndex = 0;
    var firstIndex = -1;
    while (foundIndex != -1) {
      foundIndex = original.findIndex(
        ori => ori[uniqueSelector] === dat[uniqueSelector]
      );
      if (foundIndex >= 0) {
        if (firstIndex == -1) firstIndex = foundIndex;
        original.splice(foundIndex, 1);
      }
    }
    if (firstIndex >= 0) {
      original.splice(firstIndex, 0, dat);
    } else {
      original.push(dat);
    }
  });

  return original;
};

export default mergeArrayOfObjects;
