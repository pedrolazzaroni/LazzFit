/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {EventConfig} from './AnimatedEvent';
import NativeAnimatedNonTurboModule from './NativeAnimatedModule';
import NativeAnimatedTurboModule from './NativeAnimatedTurboModule';
import NativeEventEmitter from '../../EventEmitter/NativeEventEmitter';
import Platform from '../../Utilities/Platform';
import {RCTDeviceEventEmitter} from '../../EventEmitter/RCTDeviceEventEmitter';
import ReactNativeFeatureFlags from '../../../ReactNativeFeatureFlags';

// TODO T69437152 @petetheheat - Delete this once this native component is OSS
const NativeAnimatedModule =
  Platform.OS === 'ios'
    ? NativeAnimatedNonTurboModule
    : ReactNativeFeatureFlags.animatedShouldUseTurboModule()
    ? NativeAnimatedTurboModule
    : NativeAnimatedNonTurboModule;

let __nativeAnimatedNodeTagCount = 1; /* used for animated nodes */
let __nativeAnimationIdCount = 1; /* used for started animations */

let nativeEventEmitter;

/**
 * Simple wrappers around NativeAnimatedModule to provide flow and autocomplete support for
 * the native module methods.
 */
const API = {
  getValue: function (
    tag: number,
    saveValueCallback: (value: number) => void,
  ): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.getValue(tag, saveValueCallback);
    }
  },

  setWaitingForIdentifier: function (id: string): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.setWaitingForIdentifier(id);
    }
  },

  unsetWaitingForIdentifier: function (id: string): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.unsetWaitingForIdentifier(id);
    }
  },

  // FIXME T90415202: Sort method defintions in NativeAnimatedModule.js
  /* eslint-disable sorting/sort-object-props */
  startOperationBatch: function (): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.startOperationBatch();
    }
  },

  finishOperationBatch: function (): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.finishOperationBatch();
    }
  },

  createAnimatedNode: function (tag: number, config: Object): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.createAnimatedNode(tag, config);
    }
  },

  startListeningToAnimatedNodeValue: function (tag: number) {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.startListeningToAnimatedNodeValue(tag);
    }
  },

  stopListeningToAnimatedNodeValue: function (tag: number) {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.stopListeningToAnimatedNodeValue(tag);
    }
  },

  connectAnimatedNodes: function (parentTag: number, childTag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.connectAnimatedNodes(parentTag, childTag);
    }
  },

  disconnectAnimatedNodes: function (parentTag: number, childTag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.disconnectAnimatedNodes(parentTag, childTag);
    }
  },

  startAnimatingNode: function (
    animationId: number,
    nodeTag: number,
    config: Object,
    endCallback: (result: {finished: boolean}) => void,
  ): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.startAnimatingNode(
        animationId,
        nodeTag,
        config,
        endCallback,
      );
    }
  },

  stopAnimation: function (animationId: number) {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.stopAnimation(animationId);
    }
  },

  setAnimatedNodeValue: function (nodeTag: number, value: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.setAnimatedNodeValue(nodeTag, value);
    }
  },

  setAnimatedNodeOffset: function (nodeTag: number, offset: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.setAnimatedNodeOffset(nodeTag, offset);
    }
  },

  flattenAnimatedNodeOffset: function (nodeTag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.flattenAnimatedNodeOffset(nodeTag);
    }
  },

  extractAnimatedNodeOffset: function (nodeTag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.extractAnimatedNodeOffset(nodeTag);
    }
  },

  connectAnimatedNodeToView: function (nodeTag: number, viewTag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.connectAnimatedNodeToView(nodeTag, viewTag);
    }
  },

  disconnectAnimatedNodeFromView: function (
    nodeTag: number,
    viewTag: number,
  ): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.disconnectAnimatedNodeFromView(nodeTag, viewTag);
    }
  },

  restoreDefaultValues: function (nodeTag: number): void {
    if (NativeAnimatedModule) {
      // Backwards compat with older native runtimes, can be removed later.
      if (NativeAnimatedModule.restoreDefaultValues != null) {
        NativeAnimatedModule.restoreDefaultValues(nodeTag);
      }
    }
  },

  dropAnimatedNode: function (tag: number): void {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.dropAnimatedNode(tag);
    }
  },

  addAnimatedEventToView: function (
    viewTag: number,
    eventName: string,
    eventMapping: EventConfig,
  ) {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.addAnimatedEventToView(
        viewTag,
        eventName,
        eventMapping,
      );
    }
  },

  removeAnimatedEventFromView(
    viewTag: number,
    eventName: string,
    animatedNodeTag: number,
  ) {
    if (NativeAnimatedModule) {
      NativeAnimatedModule.removeAnimatedEventFromView(
        viewTag,
        eventName,
        animatedNodeTag,
      );
    }
  },
};

/**
 * Styles allowed by the native animated implementation.
 *
 * In general native animated implementation should support any numeric property that doesn't need
 * to be updated through the shadow view hierarchy (all non-layout properties).
 */
const SUPPORTED_STYLES = {
  opacity: true,
  transform: true,
  borderRadius: true,
  borderBottomEndRadius: true,
  borderBottomLeftRadius: true,
  borderBottomRightRadius: true,
  borderBottomStartRadius: true,
  borderTopEndRadius: true,
  borderTopLeftRadius: true,
  borderTopRightRadius: true,
  borderTopStartRadius: true,
  elevation: true,
  zIndex: true,
  /* ios styles */
  shadowOpacity: true,
  shadowRadius: true,
  /* legacy android transform properties */
  scaleX: true,
  scaleY: true,
  translateX: true,
  translateY: true,
};

const SUPPORTED_TRANSFORMS = {
  translateX: true,
  translateY: true,
  scale: true,
  scaleX: true,
  scaleY: true,
  rotate: true,
  rotateX: true,
  rotateY: true,
  rotateZ: true,
  perspective: true,
};

const SUPPORTED_INTERPOLATION_PARAMS = {
  inputRange: true,
  outputRange: true,
  extrapolate: true,
  extrapolateRight: true,
  extrapolateLeft: true,
};

function addWhitelistedStyleProp(prop: string): void {
  SUPPORTED_STYLES[prop] = true;
}

function addWhitelistedTransformProp(prop: string): void {
  SUPPORTED_TRANSFORMS[prop] = true;
}

function addWhitelistedInterpolationParam(param: string): void {
  SUPPORTED_INTERPOLATION_PARAMS[param] = true;
}

function validateTransform(configs: Array<Object>): void {
  configs.forEach(config => {
    if (!SUPPORTED_TRANSFORMS.hasOwnProperty(config.property)) {
      throw new Error(
        `Property '${config.property}' is not supported by native animated module`,
      );
    }
  });
}

function validateStyles(styles: Object): void {
  for (const key in styles) {
    if (!SUPPORTED_STYLES.hasOwnProperty(key)) {
      throw new Error(
        `Style property '${key}' is not supported by native animated module`,
      );
    }
  }
}

function validateInterpolation(config: Object): void {
  for (const key in config) {
    if (!SUPPORTED_INTERPOLATION_PARAMS.hasOwnProperty(key)) {
      throw new Error(
        `Interpolation property '${key}' is not supported by native animated module`,
      );
    }
  }
}

function generateNewNodeTag(): number {
  return __nativeAnimatedNodeTagCount++;
}

function generateNewAnimationId(): number {
  return __nativeAnimationIdCount++;
}

function assertNativeAnimatedModule(): void {
  if (!NativeAnimatedModule) {
    throw new Error(
      `Native animated module is not available for operating system - ${Platform.OS}`,
    );
  }
}

let _warnedMissingNativeAnimated = false;

function shouldUseNativeDriver(
  config: AnimationConfig | EventConfig,
  ...options: Array<boolean>
): boolean {
  if (config.useNativeDriver == null) {
    config.useNativeDriver = false;
  }

  if (config.useNativeDriver === true && !NativeAnimatedModule) {
    if (!_warnedMissingNativeAnimated) {
      console.warn(
        'Animated: `useNativeDriver` was not specified. Using JS driven animations. ' +
          'To learn more about native driven animations, see https://reactnative.dev/docs/animation.html#useNativeDriver.',
      );
      _warnedMissingNativeAnimated = true;
    }
    return false;
  }

  return config.useNativeDriver || false;
}

function transformDataType(value: number | string): number | string {
  // Return if it's already a number
  if (typeof value !== 'string') {
    return value;
  }
  if (/deg$/.test(value)) {
    const degrees = parseFloat(value) || 0;
    const radians = (degrees * Math.PI) / 180.0;
    return radians;
  } else {
    return value;
  }
}

module.exports = {
  API,
  addWhitelistedStyleProp,
  addWhitelistedTransformProp,
  addWhitelistedInterpolationParam,
  validateStyles,
  validateTransform,
  validateInterpolation,
  generateNewNodeTag,
  generateNewAnimationId,
  assertNativeAnimatedModule,
  shouldUseNativeDriver,
  transformDataType,
  // $FlowExpectedError[unsafe-getters-setters] - unsafe getter lint suppresion
  get nativeEventEmitter(): NativeEventEmitter {
    if (!nativeEventEmitter) {
      nativeEventEmitter = new NativeEventEmitter(NativeAnimatedModule);
    }
    return nativeEventEmitter;
  },
};
