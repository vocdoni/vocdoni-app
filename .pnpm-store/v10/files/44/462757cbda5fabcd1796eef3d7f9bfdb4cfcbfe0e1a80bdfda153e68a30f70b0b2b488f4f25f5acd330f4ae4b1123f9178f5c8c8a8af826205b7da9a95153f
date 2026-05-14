"use client";
import {
  darkTheme
} from "./chunk-RZWDCITT.js";
import {
  lightTheme
} from "./chunk-72HZGUJA.js";
import {
  midnightTheme
} from "./chunk-7ZP3ENJ2.js";
import "./chunk-DQLAW7KN.js";
import {
  en_US_default
} from "./chunk-RDNMH5RE.js";

// src/components/ConnectButton/ConnectButton.tsx
import React60, { useContext as useContext22, useEffect as useEffect18, useState as useState15 } from "react";

// src/css/sprinkles.css.ts
import { createMapValueFn as _51c72 } from "@vanilla-extract/sprinkles/createUtils";
import { createNormalizeValueFn as _a49f6 } from "@vanilla-extract/sprinkles/createUtils";
import { createSprinkles as _ad221 } from "@vanilla-extract/sprinkles/createRuntimeSprinkles";
var largeScreenMinWidth = 768;
var mapResponsiveValue = _51c72({ conditions: { defaultCondition: "smallScreen", conditionNames: ["smallScreen", "largeScreen"], responsiveArray: void 0 } });
var normalizeResponsiveValue = _a49f6({ conditions: { defaultCondition: "smallScreen", conditionNames: ["smallScreen", "largeScreen"], responsiveArray: void 0 } });
var sprinkles = _ad221({ conditions: { defaultCondition: "base", conditionNames: ["base", "hover", "active"], responsiveArray: void 0 }, styles: { background: { values: { accentColor: { conditions: { base: "ju367v9i", hover: "ju367v9j", active: "ju367v9k" }, defaultClass: "ju367v9i" }, accentColorForeground: { conditions: { base: "ju367v9l", hover: "ju367v9m", active: "ju367v9n" }, defaultClass: "ju367v9l" }, actionButtonBorder: { conditions: { base: "ju367v9o", hover: "ju367v9p", active: "ju367v9q" }, defaultClass: "ju367v9o" }, actionButtonBorderMobile: { conditions: { base: "ju367v9r", hover: "ju367v9s", active: "ju367v9t" }, defaultClass: "ju367v9r" }, actionButtonSecondaryBackground: { conditions: { base: "ju367v9u", hover: "ju367v9v", active: "ju367v9w" }, defaultClass: "ju367v9u" }, closeButton: { conditions: { base: "ju367v9x", hover: "ju367v9y", active: "ju367v9z" }, defaultClass: "ju367v9x" }, closeButtonBackground: { conditions: { base: "ju367va0", hover: "ju367va1", active: "ju367va2" }, defaultClass: "ju367va0" }, connectButtonBackground: { conditions: { base: "ju367va3", hover: "ju367va4", active: "ju367va5" }, defaultClass: "ju367va3" }, connectButtonBackgroundError: { conditions: { base: "ju367va6", hover: "ju367va7", active: "ju367va8" }, defaultClass: "ju367va6" }, connectButtonInnerBackground: { conditions: { base: "ju367va9", hover: "ju367vaa", active: "ju367vab" }, defaultClass: "ju367va9" }, connectButtonText: { conditions: { base: "ju367vac", hover: "ju367vad", active: "ju367vae" }, defaultClass: "ju367vac" }, connectButtonTextError: { conditions: { base: "ju367vaf", hover: "ju367vag", active: "ju367vah" }, defaultClass: "ju367vaf" }, connectionIndicator: { conditions: { base: "ju367vai", hover: "ju367vaj", active: "ju367vak" }, defaultClass: "ju367vai" }, downloadBottomCardBackground: { conditions: { base: "ju367val", hover: "ju367vam", active: "ju367van" }, defaultClass: "ju367val" }, downloadTopCardBackground: { conditions: { base: "ju367vao", hover: "ju367vap", active: "ju367vaq" }, defaultClass: "ju367vao" }, error: { conditions: { base: "ju367var", hover: "ju367vas", active: "ju367vat" }, defaultClass: "ju367var" }, generalBorder: { conditions: { base: "ju367vau", hover: "ju367vav", active: "ju367vaw" }, defaultClass: "ju367vau" }, generalBorderDim: { conditions: { base: "ju367vax", hover: "ju367vay", active: "ju367vaz" }, defaultClass: "ju367vax" }, menuItemBackground: { conditions: { base: "ju367vb0", hover: "ju367vb1", active: "ju367vb2" }, defaultClass: "ju367vb0" }, modalBackdrop: { conditions: { base: "ju367vb3", hover: "ju367vb4", active: "ju367vb5" }, defaultClass: "ju367vb3" }, modalBackground: { conditions: { base: "ju367vb6", hover: "ju367vb7", active: "ju367vb8" }, defaultClass: "ju367vb6" }, modalBorder: { conditions: { base: "ju367vb9", hover: "ju367vba", active: "ju367vbb" }, defaultClass: "ju367vb9" }, modalText: { conditions: { base: "ju367vbc", hover: "ju367vbd", active: "ju367vbe" }, defaultClass: "ju367vbc" }, modalTextDim: { conditions: { base: "ju367vbf", hover: "ju367vbg", active: "ju367vbh" }, defaultClass: "ju367vbf" }, modalTextSecondary: { conditions: { base: "ju367vbi", hover: "ju367vbj", active: "ju367vbk" }, defaultClass: "ju367vbi" }, profileAction: { conditions: { base: "ju367vbl", hover: "ju367vbm", active: "ju367vbn" }, defaultClass: "ju367vbl" }, profileActionHover: { conditions: { base: "ju367vbo", hover: "ju367vbp", active: "ju367vbq" }, defaultClass: "ju367vbo" }, profileForeground: { conditions: { base: "ju367vbr", hover: "ju367vbs", active: "ju367vbt" }, defaultClass: "ju367vbr" }, selectedOptionBorder: { conditions: { base: "ju367vbu", hover: "ju367vbv", active: "ju367vbw" }, defaultClass: "ju367vbu" }, standby: { conditions: { base: "ju367vbx", hover: "ju367vby", active: "ju367vbz" }, defaultClass: "ju367vbx" } } }, borderColor: { values: { accentColor: { conditions: { base: "ju367vc0", hover: "ju367vc1", active: "ju367vc2" }, defaultClass: "ju367vc0" }, accentColorForeground: { conditions: { base: "ju367vc3", hover: "ju367vc4", active: "ju367vc5" }, defaultClass: "ju367vc3" }, actionButtonBorder: { conditions: { base: "ju367vc6", hover: "ju367vc7", active: "ju367vc8" }, defaultClass: "ju367vc6" }, actionButtonBorderMobile: { conditions: { base: "ju367vc9", hover: "ju367vca", active: "ju367vcb" }, defaultClass: "ju367vc9" }, actionButtonSecondaryBackground: { conditions: { base: "ju367vcc", hover: "ju367vcd", active: "ju367vce" }, defaultClass: "ju367vcc" }, closeButton: { conditions: { base: "ju367vcf", hover: "ju367vcg", active: "ju367vch" }, defaultClass: "ju367vcf" }, closeButtonBackground: { conditions: { base: "ju367vci", hover: "ju367vcj", active: "ju367vck" }, defaultClass: "ju367vci" }, connectButtonBackground: { conditions: { base: "ju367vcl", hover: "ju367vcm", active: "ju367vcn" }, defaultClass: "ju367vcl" }, connectButtonBackgroundError: { conditions: { base: "ju367vco", hover: "ju367vcp", active: "ju367vcq" }, defaultClass: "ju367vco" }, connectButtonInnerBackground: { conditions: { base: "ju367vcr", hover: "ju367vcs", active: "ju367vct" }, defaultClass: "ju367vcr" }, connectButtonText: { conditions: { base: "ju367vcu", hover: "ju367vcv", active: "ju367vcw" }, defaultClass: "ju367vcu" }, connectButtonTextError: { conditions: { base: "ju367vcx", hover: "ju367vcy", active: "ju367vcz" }, defaultClass: "ju367vcx" }, connectionIndicator: { conditions: { base: "ju367vd0", hover: "ju367vd1", active: "ju367vd2" }, defaultClass: "ju367vd0" }, downloadBottomCardBackground: { conditions: { base: "ju367vd3", hover: "ju367vd4", active: "ju367vd5" }, defaultClass: "ju367vd3" }, downloadTopCardBackground: { conditions: { base: "ju367vd6", hover: "ju367vd7", active: "ju367vd8" }, defaultClass: "ju367vd6" }, error: { conditions: { base: "ju367vd9", hover: "ju367vda", active: "ju367vdb" }, defaultClass: "ju367vd9" }, generalBorder: { conditions: { base: "ju367vdc", hover: "ju367vdd", active: "ju367vde" }, defaultClass: "ju367vdc" }, generalBorderDim: { conditions: { base: "ju367vdf", hover: "ju367vdg", active: "ju367vdh" }, defaultClass: "ju367vdf" }, menuItemBackground: { conditions: { base: "ju367vdi", hover: "ju367vdj", active: "ju367vdk" }, defaultClass: "ju367vdi" }, modalBackdrop: { conditions: { base: "ju367vdl", hover: "ju367vdm", active: "ju367vdn" }, defaultClass: "ju367vdl" }, modalBackground: { conditions: { base: "ju367vdo", hover: "ju367vdp", active: "ju367vdq" }, defaultClass: "ju367vdo" }, modalBorder: { conditions: { base: "ju367vdr", hover: "ju367vds", active: "ju367vdt" }, defaultClass: "ju367vdr" }, modalText: { conditions: { base: "ju367vdu", hover: "ju367vdv", active: "ju367vdw" }, defaultClass: "ju367vdu" }, modalTextDim: { conditions: { base: "ju367vdx", hover: "ju367vdy", active: "ju367vdz" }, defaultClass: "ju367vdx" }, modalTextSecondary: { conditions: { base: "ju367ve0", hover: "ju367ve1", active: "ju367ve2" }, defaultClass: "ju367ve0" }, profileAction: { conditions: { base: "ju367ve3", hover: "ju367ve4", active: "ju367ve5" }, defaultClass: "ju367ve3" }, profileActionHover: { conditions: { base: "ju367ve6", hover: "ju367ve7", active: "ju367ve8" }, defaultClass: "ju367ve6" }, profileForeground: { conditions: { base: "ju367ve9", hover: "ju367vea", active: "ju367veb" }, defaultClass: "ju367ve9" }, selectedOptionBorder: { conditions: { base: "ju367vec", hover: "ju367ved", active: "ju367vee" }, defaultClass: "ju367vec" }, standby: { conditions: { base: "ju367vef", hover: "ju367veg", active: "ju367veh" }, defaultClass: "ju367vef" } } }, boxShadow: { values: { connectButton: { conditions: { base: "ju367vei", hover: "ju367vej", active: "ju367vek" }, defaultClass: "ju367vei" }, dialog: { conditions: { base: "ju367vel", hover: "ju367vem", active: "ju367ven" }, defaultClass: "ju367vel" }, profileDetailsAction: { conditions: { base: "ju367veo", hover: "ju367vep", active: "ju367veq" }, defaultClass: "ju367veo" }, selectedOption: { conditions: { base: "ju367ver", hover: "ju367ves", active: "ju367vet" }, defaultClass: "ju367ver" }, selectedWallet: { conditions: { base: "ju367veu", hover: "ju367vev", active: "ju367vew" }, defaultClass: "ju367veu" }, walletLogo: { conditions: { base: "ju367vex", hover: "ju367vey", active: "ju367vez" }, defaultClass: "ju367vex" } } }, color: { values: { accentColor: { conditions: { base: "ju367vf0", hover: "ju367vf1", active: "ju367vf2" }, defaultClass: "ju367vf0" }, accentColorForeground: { conditions: { base: "ju367vf3", hover: "ju367vf4", active: "ju367vf5" }, defaultClass: "ju367vf3" }, actionButtonBorder: { conditions: { base: "ju367vf6", hover: "ju367vf7", active: "ju367vf8" }, defaultClass: "ju367vf6" }, actionButtonBorderMobile: { conditions: { base: "ju367vf9", hover: "ju367vfa", active: "ju367vfb" }, defaultClass: "ju367vf9" }, actionButtonSecondaryBackground: { conditions: { base: "ju367vfc", hover: "ju367vfd", active: "ju367vfe" }, defaultClass: "ju367vfc" }, closeButton: { conditions: { base: "ju367vff", hover: "ju367vfg", active: "ju367vfh" }, defaultClass: "ju367vff" }, closeButtonBackground: { conditions: { base: "ju367vfi", hover: "ju367vfj", active: "ju367vfk" }, defaultClass: "ju367vfi" }, connectButtonBackground: { conditions: { base: "ju367vfl", hover: "ju367vfm", active: "ju367vfn" }, defaultClass: "ju367vfl" }, connectButtonBackgroundError: { conditions: { base: "ju367vfo", hover: "ju367vfp", active: "ju367vfq" }, defaultClass: "ju367vfo" }, connectButtonInnerBackground: { conditions: { base: "ju367vfr", hover: "ju367vfs", active: "ju367vft" }, defaultClass: "ju367vfr" }, connectButtonText: { conditions: { base: "ju367vfu", hover: "ju367vfv", active: "ju367vfw" }, defaultClass: "ju367vfu" }, connectButtonTextError: { conditions: { base: "ju367vfx", hover: "ju367vfy", active: "ju367vfz" }, defaultClass: "ju367vfx" }, connectionIndicator: { conditions: { base: "ju367vg0", hover: "ju367vg1", active: "ju367vg2" }, defaultClass: "ju367vg0" }, downloadBottomCardBackground: { conditions: { base: "ju367vg3", hover: "ju367vg4", active: "ju367vg5" }, defaultClass: "ju367vg3" }, downloadTopCardBackground: { conditions: { base: "ju367vg6", hover: "ju367vg7", active: "ju367vg8" }, defaultClass: "ju367vg6" }, error: { conditions: { base: "ju367vg9", hover: "ju367vga", active: "ju367vgb" }, defaultClass: "ju367vg9" }, generalBorder: { conditions: { base: "ju367vgc", hover: "ju367vgd", active: "ju367vge" }, defaultClass: "ju367vgc" }, generalBorderDim: { conditions: { base: "ju367vgf", hover: "ju367vgg", active: "ju367vgh" }, defaultClass: "ju367vgf" }, menuItemBackground: { conditions: { base: "ju367vgi", hover: "ju367vgj", active: "ju367vgk" }, defaultClass: "ju367vgi" }, modalBackdrop: { conditions: { base: "ju367vgl", hover: "ju367vgm", active: "ju367vgn" }, defaultClass: "ju367vgl" }, modalBackground: { conditions: { base: "ju367vgo", hover: "ju367vgp", active: "ju367vgq" }, defaultClass: "ju367vgo" }, modalBorder: { conditions: { base: "ju367vgr", hover: "ju367vgs", active: "ju367vgt" }, defaultClass: "ju367vgr" }, modalText: { conditions: { base: "ju367vgu", hover: "ju367vgv", active: "ju367vgw" }, defaultClass: "ju367vgu" }, modalTextDim: { conditions: { base: "ju367vgx", hover: "ju367vgy", active: "ju367vgz" }, defaultClass: "ju367vgx" }, modalTextSecondary: { conditions: { base: "ju367vh0", hover: "ju367vh1", active: "ju367vh2" }, defaultClass: "ju367vh0" }, profileAction: { conditions: { base: "ju367vh3", hover: "ju367vh4", active: "ju367vh5" }, defaultClass: "ju367vh3" }, profileActionHover: { conditions: { base: "ju367vh6", hover: "ju367vh7", active: "ju367vh8" }, defaultClass: "ju367vh6" }, profileForeground: { conditions: { base: "ju367vh9", hover: "ju367vha", active: "ju367vhb" }, defaultClass: "ju367vh9" }, selectedOptionBorder: { conditions: { base: "ju367vhc", hover: "ju367vhd", active: "ju367vhe" }, defaultClass: "ju367vhc" }, standby: { conditions: { base: "ju367vhf", hover: "ju367vhg", active: "ju367vhh" }, defaultClass: "ju367vhf" } } } } }, { conditions: { defaultCondition: "smallScreen", conditionNames: ["smallScreen", "largeScreen"], responsiveArray: void 0 }, styles: { alignItems: { values: { "flex-start": { conditions: { smallScreen: "ju367v0", largeScreen: "ju367v1" }, defaultClass: "ju367v0" }, "flex-end": { conditions: { smallScreen: "ju367v2", largeScreen: "ju367v3" }, defaultClass: "ju367v2" }, center: { conditions: { smallScreen: "ju367v4", largeScreen: "ju367v5" }, defaultClass: "ju367v4" } } }, display: { values: { none: { conditions: { smallScreen: "ju367v6", largeScreen: "ju367v7" }, defaultClass: "ju367v6" }, block: { conditions: { smallScreen: "ju367v8", largeScreen: "ju367v9" }, defaultClass: "ju367v8" }, flex: { conditions: { smallScreen: "ju367va", largeScreen: "ju367vb" }, defaultClass: "ju367va" }, inline: { conditions: { smallScreen: "ju367vc", largeScreen: "ju367vd" }, defaultClass: "ju367vc" } } } } }, { conditions: void 0, styles: { margin: { mappings: ["marginTop", "marginBottom", "marginLeft", "marginRight"] }, marginX: { mappings: ["marginLeft", "marginRight"] }, marginY: { mappings: ["marginTop", "marginBottom"] }, padding: { mappings: ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] }, paddingX: { mappings: ["paddingLeft", "paddingRight"] }, paddingY: { mappings: ["paddingTop", "paddingBottom"] }, alignSelf: { values: { "flex-start": { defaultClass: "ju367ve" }, "flex-end": { defaultClass: "ju367vf" }, center: { defaultClass: "ju367vg" } } }, backgroundSize: { values: { cover: { defaultClass: "ju367vh" } } }, borderRadius: { values: { "1": { defaultClass: "ju367vi" }, "6": { defaultClass: "ju367vj" }, "10": { defaultClass: "ju367vk" }, "13": { defaultClass: "ju367vl" }, actionButton: { defaultClass: "ju367vm" }, connectButton: { defaultClass: "ju367vn" }, menuButton: { defaultClass: "ju367vo" }, modal: { defaultClass: "ju367vp" }, modalMobile: { defaultClass: "ju367vq" }, "25%": { defaultClass: "ju367vr" }, full: { defaultClass: "ju367vs" } } }, borderStyle: { values: { solid: { defaultClass: "ju367vt" } } }, borderWidth: { values: { "0": { defaultClass: "ju367vu" }, "1": { defaultClass: "ju367vv" }, "2": { defaultClass: "ju367vw" }, "4": { defaultClass: "ju367vx" } } }, cursor: { values: { pointer: { defaultClass: "ju367vy" }, none: { defaultClass: "ju367vz" } } }, pointerEvents: { values: { none: { defaultClass: "ju367v10" }, all: { defaultClass: "ju367v11" } } }, minHeight: { values: { "8": { defaultClass: "ju367v12" }, "44": { defaultClass: "ju367v13" } } }, flexDirection: { values: { row: { defaultClass: "ju367v14" }, column: { defaultClass: "ju367v15" } } }, fontFamily: { values: { body: { defaultClass: "ju367v16" } } }, fontSize: { values: { "12": { defaultClass: "ju367v17" }, "13": { defaultClass: "ju367v18" }, "14": { defaultClass: "ju367v19" }, "16": { defaultClass: "ju367v1a" }, "18": { defaultClass: "ju367v1b" }, "20": { defaultClass: "ju367v1c" }, "23": { defaultClass: "ju367v1d" } } }, fontWeight: { values: { regular: { defaultClass: "ju367v1e" }, medium: { defaultClass: "ju367v1f" }, semibold: { defaultClass: "ju367v1g" }, bold: { defaultClass: "ju367v1h" }, heavy: { defaultClass: "ju367v1i" } } }, gap: { values: { "0": { defaultClass: "ju367v1j" }, "1": { defaultClass: "ju367v1k" }, "2": { defaultClass: "ju367v1l" }, "3": { defaultClass: "ju367v1m" }, "4": { defaultClass: "ju367v1n" }, "5": { defaultClass: "ju367v1o" }, "6": { defaultClass: "ju367v1p" }, "8": { defaultClass: "ju367v1q" }, "10": { defaultClass: "ju367v1r" }, "12": { defaultClass: "ju367v1s" }, "14": { defaultClass: "ju367v1t" }, "16": { defaultClass: "ju367v1u" }, "18": { defaultClass: "ju367v1v" }, "20": { defaultClass: "ju367v1w" }, "24": { defaultClass: "ju367v1x" }, "28": { defaultClass: "ju367v1y" }, "32": { defaultClass: "ju367v1z" }, "36": { defaultClass: "ju367v20" }, "44": { defaultClass: "ju367v21" }, "64": { defaultClass: "ju367v22" }, "-1": { defaultClass: "ju367v23" } } }, height: { values: { "1": { defaultClass: "ju367v24" }, "2": { defaultClass: "ju367v25" }, "4": { defaultClass: "ju367v26" }, "8": { defaultClass: "ju367v27" }, "12": { defaultClass: "ju367v28" }, "20": { defaultClass: "ju367v29" }, "24": { defaultClass: "ju367v2a" }, "28": { defaultClass: "ju367v2b" }, "30": { defaultClass: "ju367v2c" }, "32": { defaultClass: "ju367v2d" }, "34": { defaultClass: "ju367v2e" }, "36": { defaultClass: "ju367v2f" }, "40": { defaultClass: "ju367v2g" }, "44": { defaultClass: "ju367v2h" }, "48": { defaultClass: "ju367v2i" }, "54": { defaultClass: "ju367v2j" }, "60": { defaultClass: "ju367v2k" }, "200": { defaultClass: "ju367v2l" }, full: { defaultClass: "ju367v2m" }, max: { defaultClass: "ju367v2n" } } }, justifyContent: { values: { "flex-start": { defaultClass: "ju367v2o" }, "flex-end": { defaultClass: "ju367v2p" }, center: { defaultClass: "ju367v2q" }, "space-between": { defaultClass: "ju367v2r" }, "space-around": { defaultClass: "ju367v2s" } } }, textAlign: { values: { left: { defaultClass: "ju367v2t" }, center: { defaultClass: "ju367v2u" }, inherit: { defaultClass: "ju367v2v" } } }, marginBottom: { values: { "0": { defaultClass: "ju367v2w" }, "1": { defaultClass: "ju367v2x" }, "2": { defaultClass: "ju367v2y" }, "3": { defaultClass: "ju367v2z" }, "4": { defaultClass: "ju367v30" }, "5": { defaultClass: "ju367v31" }, "6": { defaultClass: "ju367v32" }, "8": { defaultClass: "ju367v33" }, "10": { defaultClass: "ju367v34" }, "12": { defaultClass: "ju367v35" }, "14": { defaultClass: "ju367v36" }, "16": { defaultClass: "ju367v37" }, "18": { defaultClass: "ju367v38" }, "20": { defaultClass: "ju367v39" }, "24": { defaultClass: "ju367v3a" }, "28": { defaultClass: "ju367v3b" }, "32": { defaultClass: "ju367v3c" }, "36": { defaultClass: "ju367v3d" }, "44": { defaultClass: "ju367v3e" }, "64": { defaultClass: "ju367v3f" }, "-1": { defaultClass: "ju367v3g" } } }, marginLeft: { values: { "0": { defaultClass: "ju367v3h" }, "1": { defaultClass: "ju367v3i" }, "2": { defaultClass: "ju367v3j" }, "3": { defaultClass: "ju367v3k" }, "4": { defaultClass: "ju367v3l" }, "5": { defaultClass: "ju367v3m" }, "6": { defaultClass: "ju367v3n" }, "8": { defaultClass: "ju367v3o" }, "10": { defaultClass: "ju367v3p" }, "12": { defaultClass: "ju367v3q" }, "14": { defaultClass: "ju367v3r" }, "16": { defaultClass: "ju367v3s" }, "18": { defaultClass: "ju367v3t" }, "20": { defaultClass: "ju367v3u" }, "24": { defaultClass: "ju367v3v" }, "28": { defaultClass: "ju367v3w" }, "32": { defaultClass: "ju367v3x" }, "36": { defaultClass: "ju367v3y" }, "44": { defaultClass: "ju367v3z" }, "64": { defaultClass: "ju367v40" }, "-1": { defaultClass: "ju367v41" } } }, marginRight: { values: { "0": { defaultClass: "ju367v42" }, "1": { defaultClass: "ju367v43" }, "2": { defaultClass: "ju367v44" }, "3": { defaultClass: "ju367v45" }, "4": { defaultClass: "ju367v46" }, "5": { defaultClass: "ju367v47" }, "6": { defaultClass: "ju367v48" }, "8": { defaultClass: "ju367v49" }, "10": { defaultClass: "ju367v4a" }, "12": { defaultClass: "ju367v4b" }, "14": { defaultClass: "ju367v4c" }, "16": { defaultClass: "ju367v4d" }, "18": { defaultClass: "ju367v4e" }, "20": { defaultClass: "ju367v4f" }, "24": { defaultClass: "ju367v4g" }, "28": { defaultClass: "ju367v4h" }, "32": { defaultClass: "ju367v4i" }, "36": { defaultClass: "ju367v4j" }, "44": { defaultClass: "ju367v4k" }, "64": { defaultClass: "ju367v4l" }, "-1": { defaultClass: "ju367v4m" } } }, marginTop: { values: { "0": { defaultClass: "ju367v4n" }, "1": { defaultClass: "ju367v4o" }, "2": { defaultClass: "ju367v4p" }, "3": { defaultClass: "ju367v4q" }, "4": { defaultClass: "ju367v4r" }, "5": { defaultClass: "ju367v4s" }, "6": { defaultClass: "ju367v4t" }, "8": { defaultClass: "ju367v4u" }, "10": { defaultClass: "ju367v4v" }, "12": { defaultClass: "ju367v4w" }, "14": { defaultClass: "ju367v4x" }, "16": { defaultClass: "ju367v4y" }, "18": { defaultClass: "ju367v4z" }, "20": { defaultClass: "ju367v50" }, "24": { defaultClass: "ju367v51" }, "28": { defaultClass: "ju367v52" }, "32": { defaultClass: "ju367v53" }, "36": { defaultClass: "ju367v54" }, "44": { defaultClass: "ju367v55" }, "64": { defaultClass: "ju367v56" }, "-1": { defaultClass: "ju367v57" } } }, maxWidth: { values: { "1": { defaultClass: "ju367v58" }, "2": { defaultClass: "ju367v59" }, "4": { defaultClass: "ju367v5a" }, "8": { defaultClass: "ju367v5b" }, "12": { defaultClass: "ju367v5c" }, "20": { defaultClass: "ju367v5d" }, "24": { defaultClass: "ju367v5e" }, "28": { defaultClass: "ju367v5f" }, "30": { defaultClass: "ju367v5g" }, "32": { defaultClass: "ju367v5h" }, "34": { defaultClass: "ju367v5i" }, "36": { defaultClass: "ju367v5j" }, "40": { defaultClass: "ju367v5k" }, "44": { defaultClass: "ju367v5l" }, "48": { defaultClass: "ju367v5m" }, "54": { defaultClass: "ju367v5n" }, "60": { defaultClass: "ju367v5o" }, "200": { defaultClass: "ju367v5p" }, full: { defaultClass: "ju367v5q" }, max: { defaultClass: "ju367v5r" } } }, minWidth: { values: { "1": { defaultClass: "ju367v5s" }, "2": { defaultClass: "ju367v5t" }, "4": { defaultClass: "ju367v5u" }, "8": { defaultClass: "ju367v5v" }, "12": { defaultClass: "ju367v5w" }, "20": { defaultClass: "ju367v5x" }, "24": { defaultClass: "ju367v5y" }, "28": { defaultClass: "ju367v5z" }, "30": { defaultClass: "ju367v60" }, "32": { defaultClass: "ju367v61" }, "34": { defaultClass: "ju367v62" }, "36": { defaultClass: "ju367v63" }, "40": { defaultClass: "ju367v64" }, "44": { defaultClass: "ju367v65" }, "48": { defaultClass: "ju367v66" }, "54": { defaultClass: "ju367v67" }, "60": { defaultClass: "ju367v68" }, "200": { defaultClass: "ju367v69" }, full: { defaultClass: "ju367v6a" }, max: { defaultClass: "ju367v6b" } } }, overflow: { values: { hidden: { defaultClass: "ju367v6c" } } }, paddingBottom: { values: { "0": { defaultClass: "ju367v6d" }, "1": { defaultClass: "ju367v6e" }, "2": { defaultClass: "ju367v6f" }, "3": { defaultClass: "ju367v6g" }, "4": { defaultClass: "ju367v6h" }, "5": { defaultClass: "ju367v6i" }, "6": { defaultClass: "ju367v6j" }, "8": { defaultClass: "ju367v6k" }, "10": { defaultClass: "ju367v6l" }, "12": { defaultClass: "ju367v6m" }, "14": { defaultClass: "ju367v6n" }, "16": { defaultClass: "ju367v6o" }, "18": { defaultClass: "ju367v6p" }, "20": { defaultClass: "ju367v6q" }, "24": { defaultClass: "ju367v6r" }, "28": { defaultClass: "ju367v6s" }, "32": { defaultClass: "ju367v6t" }, "36": { defaultClass: "ju367v6u" }, "44": { defaultClass: "ju367v6v" }, "64": { defaultClass: "ju367v6w" }, "-1": { defaultClass: "ju367v6x" } } }, paddingLeft: { values: { "0": { defaultClass: "ju367v6y" }, "1": { defaultClass: "ju367v6z" }, "2": { defaultClass: "ju367v70" }, "3": { defaultClass: "ju367v71" }, "4": { defaultClass: "ju367v72" }, "5": { defaultClass: "ju367v73" }, "6": { defaultClass: "ju367v74" }, "8": { defaultClass: "ju367v75" }, "10": { defaultClass: "ju367v76" }, "12": { defaultClass: "ju367v77" }, "14": { defaultClass: "ju367v78" }, "16": { defaultClass: "ju367v79" }, "18": { defaultClass: "ju367v7a" }, "20": { defaultClass: "ju367v7b" }, "24": { defaultClass: "ju367v7c" }, "28": { defaultClass: "ju367v7d" }, "32": { defaultClass: "ju367v7e" }, "36": { defaultClass: "ju367v7f" }, "44": { defaultClass: "ju367v7g" }, "64": { defaultClass: "ju367v7h" }, "-1": { defaultClass: "ju367v7i" } } }, paddingRight: { values: { "0": { defaultClass: "ju367v7j" }, "1": { defaultClass: "ju367v7k" }, "2": { defaultClass: "ju367v7l" }, "3": { defaultClass: "ju367v7m" }, "4": { defaultClass: "ju367v7n" }, "5": { defaultClass: "ju367v7o" }, "6": { defaultClass: "ju367v7p" }, "8": { defaultClass: "ju367v7q" }, "10": { defaultClass: "ju367v7r" }, "12": { defaultClass: "ju367v7s" }, "14": { defaultClass: "ju367v7t" }, "16": { defaultClass: "ju367v7u" }, "18": { defaultClass: "ju367v7v" }, "20": { defaultClass: "ju367v7w" }, "24": { defaultClass: "ju367v7x" }, "28": { defaultClass: "ju367v7y" }, "32": { defaultClass: "ju367v7z" }, "36": { defaultClass: "ju367v80" }, "44": { defaultClass: "ju367v81" }, "64": { defaultClass: "ju367v82" }, "-1": { defaultClass: "ju367v83" } } }, paddingTop: { values: { "0": { defaultClass: "ju367v84" }, "1": { defaultClass: "ju367v85" }, "2": { defaultClass: "ju367v86" }, "3": { defaultClass: "ju367v87" }, "4": { defaultClass: "ju367v88" }, "5": { defaultClass: "ju367v89" }, "6": { defaultClass: "ju367v8a" }, "8": { defaultClass: "ju367v8b" }, "10": { defaultClass: "ju367v8c" }, "12": { defaultClass: "ju367v8d" }, "14": { defaultClass: "ju367v8e" }, "16": { defaultClass: "ju367v8f" }, "18": { defaultClass: "ju367v8g" }, "20": { defaultClass: "ju367v8h" }, "24": { defaultClass: "ju367v8i" }, "28": { defaultClass: "ju367v8j" }, "32": { defaultClass: "ju367v8k" }, "36": { defaultClass: "ju367v8l" }, "44": { defaultClass: "ju367v8m" }, "64": { defaultClass: "ju367v8n" }, "-1": { defaultClass: "ju367v8o" } } }, position: { values: { absolute: { defaultClass: "ju367v8p" }, fixed: { defaultClass: "ju367v8q" }, relative: { defaultClass: "ju367v8r" } } }, WebkitUserSelect: { values: { none: { defaultClass: "ju367v8s" } } }, right: { values: { "0": { defaultClass: "ju367v8t" } } }, transition: { values: { "default": { defaultClass: "ju367v8u" }, transform: { defaultClass: "ju367v8v" } } }, userSelect: { values: { none: { defaultClass: "ju367v8w" } } }, width: { values: { "1": { defaultClass: "ju367v8x" }, "2": { defaultClass: "ju367v8y" }, "4": { defaultClass: "ju367v8z" }, "8": { defaultClass: "ju367v90" }, "12": { defaultClass: "ju367v91" }, "20": { defaultClass: "ju367v92" }, "24": { defaultClass: "ju367v93" }, "28": { defaultClass: "ju367v94" }, "30": { defaultClass: "ju367v95" }, "32": { defaultClass: "ju367v96" }, "34": { defaultClass: "ju367v97" }, "36": { defaultClass: "ju367v98" }, "40": { defaultClass: "ju367v99" }, "44": { defaultClass: "ju367v9a" }, "48": { defaultClass: "ju367v9b" }, "54": { defaultClass: "ju367v9c" }, "60": { defaultClass: "ju367v9d" }, "200": { defaultClass: "ju367v9e" }, full: { defaultClass: "ju367v9f" }, max: { defaultClass: "ju367v9g" } } }, backdropFilter: { values: { modalOverlay: { defaultClass: "ju367v9h" } } } } });
var themeVars = { colors: { accentColor: "var(--rk-colors-accentColor)", accentColorForeground: "var(--rk-colors-accentColorForeground)", actionButtonBorder: "var(--rk-colors-actionButtonBorder)", actionButtonBorderMobile: "var(--rk-colors-actionButtonBorderMobile)", actionButtonSecondaryBackground: "var(--rk-colors-actionButtonSecondaryBackground)", closeButton: "var(--rk-colors-closeButton)", closeButtonBackground: "var(--rk-colors-closeButtonBackground)", connectButtonBackground: "var(--rk-colors-connectButtonBackground)", connectButtonBackgroundError: "var(--rk-colors-connectButtonBackgroundError)", connectButtonInnerBackground: "var(--rk-colors-connectButtonInnerBackground)", connectButtonText: "var(--rk-colors-connectButtonText)", connectButtonTextError: "var(--rk-colors-connectButtonTextError)", connectionIndicator: "var(--rk-colors-connectionIndicator)", downloadBottomCardBackground: "var(--rk-colors-downloadBottomCardBackground)", downloadTopCardBackground: "var(--rk-colors-downloadTopCardBackground)", error: "var(--rk-colors-error)", generalBorder: "var(--rk-colors-generalBorder)", generalBorderDim: "var(--rk-colors-generalBorderDim)", menuItemBackground: "var(--rk-colors-menuItemBackground)", modalBackdrop: "var(--rk-colors-modalBackdrop)", modalBackground: "var(--rk-colors-modalBackground)", modalBorder: "var(--rk-colors-modalBorder)", modalText: "var(--rk-colors-modalText)", modalTextDim: "var(--rk-colors-modalTextDim)", modalTextSecondary: "var(--rk-colors-modalTextSecondary)", profileAction: "var(--rk-colors-profileAction)", profileActionHover: "var(--rk-colors-profileActionHover)", profileForeground: "var(--rk-colors-profileForeground)", selectedOptionBorder: "var(--rk-colors-selectedOptionBorder)", standby: "var(--rk-colors-standby)" }, fonts: { body: "var(--rk-fonts-body)" }, radii: { actionButton: "var(--rk-radii-actionButton)", connectButton: "var(--rk-radii-connectButton)", menuButton: "var(--rk-radii-menuButton)", modal: "var(--rk-radii-modal)", modalMobile: "var(--rk-radii-modalMobile)" }, shadows: { connectButton: "var(--rk-shadows-connectButton)", dialog: "var(--rk-shadows-dialog)", profileDetailsAction: "var(--rk-shadows-profileDetailsAction)", selectedOption: "var(--rk-shadows-selectedOption)", selectedWallet: "var(--rk-shadows-selectedWallet)", walletLogo: "var(--rk-shadows-walletLogo)" }, blurs: { modalOverlay: "var(--rk-blurs-modalOverlay)" } };

// src/css/touchableStyles.css.ts
var active = { shrink: "_12cbo8i6", shrinkSm: "_12cbo8i7" };
var base = "_12cbo8i3 ju367v8r";
var hover = { grow: "_12cbo8i4", growLg: "_12cbo8i5" };

// src/css/touchableStyles.ts
function touchableStyles({ active: active2, hover: hover2 }) {
  return [base, hover2 && hover[hover2], active[active2]];
}

// src/hooks/useConnectionStatus.ts
import { useAccount as useAccount2 } from "wagmi";

// src/components/RainbowKitProvider/AuthenticationContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useAccount, useAccountEffect } from "wagmi";
function createAuthenticationAdapter(adapter) {
  return adapter;
}
var AuthenticationContext = createContext(
  null
);
function RainbowKitAuthenticationProvider({
  adapter,
  children,
  enabled = true,
  status
}) {
  const { connector } = useAccount();
  const [currentConnectorUid, setCurrentConnectorUid] = useState();
  useAccountEffect({
    onDisconnect: () => {
      adapter.signOut();
      setCurrentConnectorUid(void 0);
    }
  });
  const handleChangedAccount = (data) => {
    if (data.accounts) {
      setCurrentConnectorUid(void 0);
      adapter.signOut();
    }
  };
  useEffect(() => {
    if (typeof connector?.emitter?.on === "function" && status === "authenticated") {
      setCurrentConnectorUid(connector?.uid);
      connector.emitter.on("change", handleChangedAccount);
      return () => {
        connector.emitter.off("change", handleChangedAccount);
      };
    }
  }, [connector?.emitter, status]);
  useEffect(() => {
    if (currentConnectorUid && typeof connector?.emitter?.on === "function" && status === "authenticated") {
      if (connector?.uid !== currentConnectorUid) {
        setCurrentConnectorUid(void 0);
        adapter.signOut();
      }
    }
  }, [connector?.emitter, currentConnectorUid, status]);
  return /* @__PURE__ */ React.createElement(
    AuthenticationContext.Provider,
    {
      value: useMemo(
        () => enabled ? { adapter, status } : null,
        [enabled, adapter, status]
      )
    },
    children
  );
}
function useAuthenticationAdapter() {
  const { adapter } = useContext(AuthenticationContext) ?? {};
  if (!adapter) {
    throw new Error("No authentication adapter found");
  }
  return adapter;
}
function useAuthenticationStatus() {
  const contextValue = useContext(AuthenticationContext);
  return contextValue?.status ?? null;
}

// src/hooks/useConnectionStatus.ts
function useConnectionStatus() {
  const authenticationStatus = useAuthenticationStatus();
  const { isConnected } = useAccount2();
  if (!isConnected) {
    return "disconnected";
  }
  if (!authenticationStatus) {
    return "connected";
  }
  if (authenticationStatus === "loading" || authenticationStatus === "unauthenticated") {
    return authenticationStatus;
  }
  return "connected";
}

// src/utils/isMobile.ts
function isAndroid() {
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}
function isSmallIOS() {
  return typeof navigator !== "undefined" && /iPhone|iPod/.test(navigator.userAgent);
}
function isLargeIOS() {
  return typeof navigator !== "undefined" && (/iPad/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
function isIOS() {
  return isSmallIOS() || isLargeIOS();
}
function isMobile() {
  return isAndroid() || isIOS();
}

// src/components/AsyncImage/AsyncImage.tsx
import React3, { useReducer as useReducer2 } from "react";

// src/components/Box/Box.ts
import clsx2 from "clsx";
import React2 from "react";

// src/css/atoms.ts
import clsx from "clsx";

// src/css/reset.css.ts
var base2 = "iekbcc0";
var element = { a: "iekbcca", blockquote: "iekbcc2", button: "iekbcc9", input: "iekbcc8 iekbcc5 iekbcc4", mark: "iekbcc6", ol: "iekbcc1", q: "iekbcc2", select: "iekbcc7 iekbcc5 iekbcc4", table: "iekbcc3", textarea: "iekbcc5 iekbcc4", ul: "iekbcc1" };

// src/css/atoms.ts
var atoms = ({ reset, ...rest }) => {
  if (!reset) return sprinkles(rest);
  const elementReset = element[reset];
  const sprinklesClasses = sprinkles(rest);
  return clsx(base2, elementReset, sprinklesClasses);
};

// src/components/Box/Box.ts
var Box = React2.forwardRef(
  ({ as = "div", className, testId, ...props }, ref) => {
    const atomProps = {};
    const nativeProps = {};
    for (const key in props) {
      if (sprinkles.properties.has(key)) {
        atomProps[key] = props[key];
      } else {
        nativeProps[key] = props[key];
      }
    }
    const atomicClasses = atoms({
      reset: typeof as === "string" ? as : "div",
      ...atomProps
    });
    return React2.createElement(as, {
      className: clsx2(atomicClasses, className),
      ...nativeProps,
      "data-testid": testId ? `rk-${testId.replace(/^rk-/, "")}` : void 0,
      ref
    });
  }
);
Box.displayName = "Box";

// src/components/AsyncImage/useAsyncImage.ts
import { useEffect as useEffect2, useReducer } from "react";
var cachedUrls = /* @__PURE__ */ new Map();
var cachedRequestPromises = /* @__PURE__ */ new Map();
async function loadAsyncImage(asyncImage) {
  const cachedRequestPromise = cachedRequestPromises.get(asyncImage);
  if (cachedRequestPromise) {
    return cachedRequestPromise;
  }
  const load = async () => asyncImage().then(async (url) => {
    cachedUrls.set(asyncImage, url);
    return url;
  });
  const requestPromise = load().catch((_err) => {
    return load().catch((_err2) => {
      cachedRequestPromises.delete(asyncImage);
    });
  });
  cachedRequestPromises.set(asyncImage, requestPromise);
  return requestPromise;
}
async function loadImages(...urls) {
  return await Promise.all(
    urls.map((url) => typeof url === "function" ? loadAsyncImage(url) : url)
  );
}
function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}
function useAsyncImage(url) {
  const cachedUrl = typeof url === "function" ? cachedUrls.get(url) : void 0;
  const forceUpdate = useForceUpdate();
  useEffect2(() => {
    if (typeof url === "function" && !cachedUrl) {
      loadAsyncImage(url).then(forceUpdate);
    }
  }, [url, cachedUrl, forceUpdate]);
  return typeof url === "function" ? cachedUrl : url;
}

// src/components/AsyncImage/AsyncImage.tsx
function AsyncImage({
  alt,
  background,
  borderColor,
  borderRadius,
  useAsImage,
  boxShadow,
  height,
  src: srcProp,
  width,
  testId
}) {
  const ios = isIOS();
  const src7 = useAsyncImage(srcProp);
  const isRemoteImage = src7 && /^http/.test(src7);
  const [isRemoteImageLoaded, setRemoteImageLoaded] = useReducer2(
    () => true,
    false
  );
  return /* @__PURE__ */ React3.createElement(
    Box,
    {
      "aria-label": alt,
      borderRadius,
      boxShadow,
      height: typeof height === "string" ? height : void 0,
      overflow: "hidden",
      position: "relative",
      role: "img",
      style: {
        background,
        height: typeof height === "number" ? height : void 0,
        width: typeof width === "number" ? width : void 0
      },
      width: typeof width === "string" ? width : void 0,
      testId
    },
    /* @__PURE__ */ React3.createElement(
      Box,
      {
        ...isRemoteImage ? (
          // biome-ignore format: design system keys
          {
            "aria-hidden": true,
            as: "img",
            onLoad: setRemoteImageLoaded,
            src: src7
          }
        ) : { "aria-hidden": true, as: "img", src: src7 },
        height: "full",
        position: "absolute",
        ...ios ? { WebkitUserSelect: "none" } : {},
        style: {
          WebkitTouchCallout: "none",
          transition: "opacity .15s linear",
          userSelect: "none",
          ...!useAsImage && isRemoteImage ? {
            opacity: isRemoteImageLoaded ? 1 : 0
          } : {}
        },
        width: "full"
      }
    ),
    borderColor ? /* @__PURE__ */ React3.createElement(
      Box,
      {
        ...typeof borderColor === "object" && "custom" in borderColor ? { style: { borderColor: borderColor.custom } } : { borderColor },
        borderRadius,
        borderStyle: "solid",
        borderWidth: "1",
        height: "full",
        position: "relative",
        width: "full"
      }
    ) : null
  );
}

// src/components/Avatar/Avatar.tsx
import React6, { useContext as useContext2 } from "react";

// src/components/Icons/Spinner.tsx
import React4, { useMemo as useMemo2 } from "react";

// src/components/Icons/Icons.css.ts
var SpinnerIconClassName = "_1luule42";
var SpinnerIconPathClassName = "_1luule43";

// src/components/Icons/Spinner.tsx
var useRandomId = (prefix) => useMemo2(
  () => `${prefix}_${Math.round(Math.random() * 1e9)}`,
  [prefix]
);
var SpinnerIcon = ({
  height = 21,
  width = 21
}) => {
  const id = useRandomId("spinner");
  return /* @__PURE__ */ React4.createElement(
    "svg",
    {
      className: SpinnerIconClassName,
      fill: "none",
      height,
      viewBox: "0 0 21 21",
      width,
      xmlns: "http://www.w3.org/2000/svg"
    },
    /* @__PURE__ */ React4.createElement("title", null, "Loading"),
    /* @__PURE__ */ React4.createElement("clipPath", { id }, /* @__PURE__ */ React4.createElement("path", { d: "M10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C11.3284 18 12 18.6716 12 19.5C12 20.3284 11.3284 21 10.5 21C4.70101 21 0 16.299 0 10.5C0 4.70101 4.70101 0 10.5 0C16.299 0 21 4.70101 21 10.5C21 11.3284 20.3284 12 19.5 12C18.6716 12 18 11.3284 18 10.5C18 6.35786 14.6421 3 10.5 3Z" })),
    /* @__PURE__ */ React4.createElement(
      "foreignObject",
      {
        clipPath: `url(#${id})`,
        height: "21",
        width: "21",
        x: "0",
        y: "0"
      },
      /* @__PURE__ */ React4.createElement("div", { className: SpinnerIconPathClassName })
    )
  );
};

// src/components/RainbowKitProvider/AvatarContext.ts
import { createContext as createContext2 } from "react";

// src/components/Avatar/EmojiAvatar.tsx
import React5, { useEffect as useEffect3, useMemo as useMemo3, useState as useState2 } from "react";

// src/components/Avatar/emojiAvatarForAddress.ts
var colors = [
  "#FC5C54",
  "#FFD95A",
  "#E95D72",
  "#6A87C8",
  "#5FD0F3",
  "#75C06B",
  "#FFDD86",
  "#5FC6D4",
  "#FF949A",
  "#FF8024",
  "#9BA1A4",
  "#EC66FF",
  "#FF8CBC",
  "#FF9A23",
  "#C5DADB",
  "#A8CE63",
  "#71ABFF",
  "#FFE279",
  "#B6B1B6",
  "#FF6780",
  "#A575FF",
  "#4D82FF",
  "#FFB35A"
];
var avatars = [
  { color: colors[0], emoji: "\u{1F336}" },
  { color: colors[1], emoji: "\u{1F911}" },
  { color: colors[2], emoji: "\u{1F419}" },
  { color: colors[3], emoji: "\u{1FAD0}" },
  { color: colors[4], emoji: "\u{1F433}" },
  { color: colors[0], emoji: "\u{1F936}" },
  { color: colors[5], emoji: "\u{1F332}" },
  { color: colors[6], emoji: "\u{1F31E}" },
  { color: colors[7], emoji: "\u{1F412}" },
  { color: colors[8], emoji: "\u{1F435}" },
  { color: colors[9], emoji: "\u{1F98A}" },
  { color: colors[10], emoji: "\u{1F43C}" },
  { color: colors[11], emoji: "\u{1F984}" },
  { color: colors[12], emoji: "\u{1F437}" },
  { color: colors[13], emoji: "\u{1F427}" },
  { color: colors[8], emoji: "\u{1F9A9}" },
  { color: colors[14], emoji: "\u{1F47D}" },
  { color: colors[0], emoji: "\u{1F388}" },
  { color: colors[8], emoji: "\u{1F349}" },
  { color: colors[1], emoji: "\u{1F389}" },
  { color: colors[15], emoji: "\u{1F432}" },
  { color: colors[16], emoji: "\u{1F30E}" },
  { color: colors[17], emoji: "\u{1F34A}" },
  { color: colors[18], emoji: "\u{1F42D}" },
  { color: colors[19], emoji: "\u{1F363}" },
  { color: colors[1], emoji: "\u{1F425}" },
  { color: colors[20], emoji: "\u{1F47E}" },
  { color: colors[15], emoji: "\u{1F966}" },
  { color: colors[0], emoji: "\u{1F479}" },
  { color: colors[17], emoji: "\u{1F640}" },
  { color: colors[4], emoji: "\u26F1" },
  { color: colors[21], emoji: "\u26F5\uFE0F" },
  { color: colors[17], emoji: "\u{1F973}" },
  { color: colors[8], emoji: "\u{1F92F}" },
  { color: colors[22], emoji: "\u{1F920}" }
];
function hashCode(text) {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}
function emojiAvatarForAddress(address) {
  const resolvedAddress = typeof address === "string" ? address : "";
  const avatarIndex = Math.abs(
    hashCode(resolvedAddress.toLowerCase()) % avatars.length
  );
  return avatars[avatarIndex ?? 0];
}

// src/components/Avatar/EmojiAvatar.tsx
var EmojiAvatar = ({ address, ensImage, size }) => {
  const [loaded, setLoaded] = useState2(false);
  useEffect3(() => {
    if (ensImage) {
      const img = new Image();
      img.src = ensImage;
      img.onload = () => setLoaded(true);
    }
  }, [ensImage]);
  const { color: backgroundColor, emoji } = useMemo3(
    () => emojiAvatarForAddress(address),
    [address]
  );
  return ensImage ? loaded ? /* @__PURE__ */ React5.createElement(
    Box,
    {
      backgroundSize: "cover",
      borderRadius: "full",
      position: "absolute",
      style: {
        backgroundImage: `url(${ensImage})`,
        backgroundPosition: "center",
        height: size,
        width: size
      }
    }
  ) : /* @__PURE__ */ React5.createElement(
    Box,
    {
      alignItems: "center",
      backgroundSize: "cover",
      borderRadius: "full",
      color: "modalText",
      display: "flex",
      justifyContent: "center",
      position: "absolute",
      style: {
        height: size,
        width: size
      }
    },
    /* @__PURE__ */ React5.createElement(SpinnerIcon, null)
  ) : /* @__PURE__ */ React5.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      overflow: "hidden",
      style: {
        ...!ensImage && { backgroundColor },
        height: size,
        width: size
      }
    },
    emoji
  );
};

// src/components/RainbowKitProvider/AvatarContext.ts
var defaultAvatar = EmojiAvatar;
var AvatarContext = createContext2(defaultAvatar);

// src/components/Avatar/Avatar.tsx
function Avatar({ address, imageUrl, loading, size }) {
  const AvatarComponent = useContext2(AvatarContext);
  return /* @__PURE__ */ React6.createElement(
    Box,
    {
      "aria-hidden": true,
      borderRadius: "full",
      overflow: "hidden",
      position: "relative",
      style: {
        height: `${size}px`,
        width: `${size}px`
      },
      userSelect: "none"
    },
    /* @__PURE__ */ React6.createElement(
      Box,
      {
        alignItems: "center",
        borderRadius: "full",
        display: "flex",
        justifyContent: "center",
        overflow: "hidden",
        position: "absolute",
        style: {
          fontSize: `${Math.round(size * 0.55)}px`,
          height: `${size}px`,
          transform: loading ? "scale(0.72)" : void 0,
          transition: ".25s ease",
          transitionDelay: loading ? void 0 : ".1s",
          width: `${size}px`,
          willChange: "transform"
        },
        userSelect: "none"
      },
      /* @__PURE__ */ React6.createElement(AvatarComponent, { address, ensImage: imageUrl, size })
    ),
    loading && /* @__PURE__ */ React6.createElement(
      Box,
      {
        color: "accentColor",
        display: "flex",
        height: "full",
        position: "absolute",
        width: "full"
      },
      /* @__PURE__ */ React6.createElement(SpinnerIcon, { height: "100%", width: "100%" })
    )
  );
}

// src/components/Icons/Dropdown.tsx
import React7 from "react";
var DropdownIcon = () => /* @__PURE__ */ React7.createElement("svg", { fill: "none", height: "7", width: "14", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React7.createElement("title", null, "Dropdown"), /* @__PURE__ */ React7.createElement(
  "path",
  {
    d: "M12.75 1.54001L8.51647 5.0038C7.77974 5.60658 6.72026 5.60658 5.98352 5.0038L1.75 1.54001",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2.5",
    xmlns: "http://www.w3.org/2000/svg"
  }
));

// src/components/RainbowKitProvider/I18nContext.tsx
import React8, {
  createContext as createContext3,
  useEffect as useEffect4,
  useMemo as useMemo4,
  useState as useState3
} from "react";

// src/locales/I18n.ts
var defaultOptions = {
  defaultLocale: "en",
  locale: "en"
};
var I18n = class {
  constructor(localeTranslations) {
    this.listeners = /* @__PURE__ */ new Set();
    this.defaultLocale = defaultOptions.defaultLocale;
    this.enableFallback = false;
    this.locale = defaultOptions.locale;
    this.cachedLocales = [];
    this.translations = {};
    for (const [locale, translation] of Object.entries(localeTranslations)) {
      this.cachedLocales = [...this.cachedLocales, locale];
      this.translations = {
        ...this.translations,
        ...this.flattenTranslation(translation, locale)
      };
    }
  }
  missingMessage(key) {
    return `[missing: "${this.locale}.${key}" translation]`;
  }
  flattenTranslation(translationObject, locale) {
    const result = {};
    const flatten = (currentTranslationObj, parentKey) => {
      for (const key of Object.keys(currentTranslationObj)) {
        const newKey = `${parentKey}.${key}`;
        const currentValue = currentTranslationObj[key];
        if (typeof currentValue === "object" && currentValue !== null) {
          flatten(currentValue, newKey);
        } else {
          result[newKey] = currentValue;
        }
      }
    };
    flatten(translationObject, locale);
    return result;
  }
  translateWithReplacements(translation, replacements = {}) {
    let translatedString = translation;
    for (const placeholder in replacements) {
      const replacementValue = replacements[placeholder];
      translatedString = translatedString.replace(
        `%{${placeholder}}`,
        replacementValue
      );
    }
    return translatedString;
  }
  t(key, replacements, options) {
    const translationKey = `${this.locale}.${key}`;
    const translation = this.translations[translationKey];
    if (!translation) {
      if (this.enableFallback) {
        const fallbackTranslationKey = `${this.defaultLocale}.${key}`;
        const fallbackTranslation = this.translations[fallbackTranslationKey];
        if (fallbackTranslation) {
          return this.translateWithReplacements(
            fallbackTranslation,
            replacements
          );
        }
      }
      if (options?.rawKeyIfTranslationMissing) return key;
      return this.missingMessage(key);
    }
    return this.translateWithReplacements(translation, replacements);
  }
  isLocaleCached(locale) {
    return this.cachedLocales.includes(locale);
  }
  updateLocale(locale) {
    this.locale = locale;
    this.notifyListeners();
  }
  setTranslations(locale, translations) {
    const cachedLocale = this.isLocaleCached(locale);
    if (!cachedLocale) {
      this.cachedLocales = [...this.cachedLocales, locale];
      this.translations = {
        ...this.translations,
        ...this.flattenTranslation(translations, locale)
      };
    }
    this.locale = locale;
    this.notifyListeners();
  }
  notifyListeners() {
    for (const listener of this.listeners) {
      listener();
    }
  }
  onChange(fn) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
};

// src/locales/index.ts
var i18n = new I18n({
  en: JSON.parse(en_US_default),
  "en-US": JSON.parse(en_US_default)
});
i18n.defaultLocale = "en-US";
i18n.locale = "en-US";
i18n.enableFallback = true;
var fetchTranslations = async (locale) => {
  switch (locale) {
    case "ar":
    case "ar-AR":
      return (await import("./ar_AR-44JUQ6EW.js")).default;
    case "de":
    case "de-DE":
      return (await import("./de_DE-PYAO5YD6.js")).default;
    case "en":
    case "en-US":
      return (await import("./en_US-Y4ZOVFV4.js")).default;
    case "es":
    case "es-419":
      return (await import("./es_419-HRGOJ6VT.js")).default;
    case "fr":
    case "fr-FR":
      return (await import("./fr_FR-IGGVC6RM.js")).default;
    case "hi":
    case "hi-IN":
      return (await import("./hi_IN-XSKAA3MF.js")).default;
    case "id":
    case "id-ID":
      return (await import("./id_ID-KUOB4UAL.js")).default;
    case "ja":
    case "ja-JP":
      return (await import("./ja_JP-4WRQ63RX.js")).default;
    case "ko":
    case "ko-KR":
      return (await import("./ko_KR-I2K7AIEP.js")).default;
    case "ms":
    case "ms-MY":
      return (await import("./ms_MY-6VZW6Q3Z.js")).default;
    case "pt":
    case "pt-BR":
      return (await import("./pt_BR-N3XOZ4SV.js")).default;
    case "ru":
    case "ru-RU":
      return (await import("./ru_RU-IITAPRET.js")).default;
    case "th":
    case "th-TH":
      return (await import("./th_TH-3ZQCKCQE.js")).default;
    case "tr":
    case "tr-TR":
      return (await import("./tr_TR-QUPUGMUF.js")).default;
    case "ua":
    case "uk-UA":
      return (await import("./uk_UA-SSN6SV5E.js")).default;
    case "vi":
    case "vi-VN":
      return (await import("./vi_VN-7BUVRNYY.js")).default;
    case "zh":
    case "zh-CN":
    case "zh-Hans":
      return (await import("./zh_CN-HJBN674C.js")).default;
    case "zh-HK":
      return (await import("./zh_HK-JW3WLRKE.js")).default;
    case "zh-Hant":
    case "zh-TW":
      return (await import("./zh_TW-VNNRNXY7.js")).default;
    default:
      return (await import("./en_US-Y4ZOVFV4.js")).default;
  }
};
async function setLocale(locale) {
  const isCached = i18n.isLocaleCached(locale);
  if (isCached) {
    i18n.updateLocale(locale);
    return;
  }
  const translations = await fetchTranslations(locale);
  i18n.setTranslations(locale, JSON.parse(translations));
}

// src/utils/locale.ts
var detectedBrowserLocale = () => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    if (navigator.languages?.length) {
      return navigator.languages[0];
    }
    if (navigator.language) {
      return navigator.language;
    }
  }
};

// src/components/RainbowKitProvider/I18nContext.tsx
var I18nContext = createContext3({ i18n });
var I18nProvider = ({ children, locale }) => {
  const [updateCount, setUpdateCount] = useState3(0);
  const browserLocale = useMemo4(
    () => detectedBrowserLocale(),
    []
  );
  useEffect4(() => {
    const unsubscribe = i18n.onChange(() => {
      setUpdateCount((count) => count + 1);
    });
    return unsubscribe;
  }, []);
  useEffect4(() => {
    if (locale && locale !== i18n.locale) {
      setLocale(locale);
    } else if (!locale && browserLocale && browserLocale !== i18n.locale) {
      setLocale(browserLocale);
    }
  }, [locale, browserLocale]);
  const memoizedValue = useMemo4(() => {
    const t = (key, options) => i18n.t(key, options);
    return { t, i18n };
  }, [updateCount]);
  return /* @__PURE__ */ React8.createElement(I18nContext.Provider, { value: memoizedValue }, children);
};

// src/components/RainbowKitProvider/RainbowKitChainContext.tsx
import React9, {
  createContext as createContext4,
  useContext as useContext3,
  useMemo as useMemo5
} from "react";
import { useConfig } from "wagmi";

// src/utils/isNotNullish.ts
function isNotNullish(value) {
  return value != null;
}

// src/components/RainbowKitProvider/provideRainbowKitChains.ts
var apeChainIcon = {
  iconBackground: "#7290CC",
  iconUrl: async () => (await import("./apechain-SX5YFU6N.js")).default
};
var arbitrumIcon = {
  iconBackground: "#96bedc",
  iconUrl: async () => (await import("./arbitrum-WURIBY6W.js")).default
};
var avalancheIcon = {
  iconBackground: "#e84141",
  iconUrl: async () => (await import("./avalanche-KOMJD3XY.js")).default
};
var baseIcon = {
  iconBackground: "#0052ff",
  iconUrl: async () => (await import("./base-OAXLRA4F.js")).default
};
var berachainIcon = {
  iconBackground: "#814625",
  iconUrl: async () => (await import("./berachain-NJECWIVC.js")).default
};
var blastIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./blast-V555OVXZ.js")).default
};
var bscIcon = {
  iconBackground: "#ebac0e",
  iconUrl: async () => (await import("./bsc-N647EYR2.js")).default
};
var celoIcon = {
  iconBackground: "#FCFF52",
  iconUrl: async () => (await import("./celo-GEP4TUHG.js")).default
};
var cronosIcon = {
  iconBackground: "#002D74",
  iconUrl: async () => (await import("./cronos-HJPAQTAE.js")).default
};
var degenIcon = {
  iconBackground: "#A36EFD",
  iconUrl: async () => (await import("./degen-FQQ4XGHB.js")).default
};
var ethereumIcon = {
  iconBackground: "#484c50",
  iconUrl: async () => (await import("./ethereum-RGGVA4PY.js")).default
};
var flowIcon = {
  iconBackground: "transparent",
  iconUrl: async () => (await import("./flow-5FQJFCTK.js")).default
};
var gnosisIcon = {
  iconBackground: "#04795c",
  iconUrl: async () => (await import("./gnosis-37ZC4RBL.js")).default
};
var gravityIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./gravity-J5YQHTYH.js")).default
};
var hardhatIcon = {
  iconBackground: "#f9f7ec",
  iconUrl: async () => (await import("./hardhat-TX56IT5N.js")).default
};
var hyperevmIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./hyperevm-VKPAA4SA.js")).default
};
var inkIcon = {
  iconBackground: "#7132F5",
  iconUrl: async () => (await import("./ink-FZMYZWHG.js")).default
};
var kaiaIcon = {
  iconBackground: "transparent",
  iconUrl: async () => (await import("./kaia-65D2U3PU.js")).default
};
var lineaIcon = {
  iconBackground: "#ffffff",
  iconUrl: async () => (await import("./linea-QRMVQ5DY.js")).default
};
var mantaIcon = {
  iconBackground: "#ffffff",
  iconUrl: async () => (await import("./manta-SI27YFEJ.js")).default
};
var mantleIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./mantle-CKIUT334.js")).default
};
var monadTestnetIcon = {
  iconBackground: "transparent",
  iconUrl: async () => (await import("./monad-4KWC6TSS.js")).default
};
var optimismIcon = {
  iconBackground: "#ff5a57",
  iconUrl: async () => (await import("./optimism-HAF2GUT7.js")).default
};
var polygonIcon = {
  iconBackground: "#9f71ec",
  iconUrl: async () => (await import("./polygon-WW6ZI7PM.js")).default
};
var roninIcon = {
  iconBackground: "#1273EA",
  iconUrl: async () => (await import("./ronin-EMCPYXZT.js")).default
};
var sankoIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./sanko-RHQYXGM5.js")).default
};
var superpositionIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./superposition-HG6MMR2Y.js")).default
};
var scrollIcon = {
  iconBackground: "#FFEEDA",
  iconUrl: async () => (await import("./scroll-5OBGQVOV.js")).default
};
var unichainIcon = {
  iconBackground: "#F50DB4",
  iconUrl: async () => (await import("./unichain-C5BWO2ZY.js")).default
};
var xdcIcon = {
  iconBackground: "#f9f7ec",
  iconUrl: async () => (await import("./xdc-KJ3TDBYO.js")).default
};
var zetachainIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./zetachain-TLDS5IPW.js")).default
};
var zkSyncIcon = {
  iconBackground: "#f9f7ec",
  iconUrl: async () => (await import("./zksync-DH7HK5U4.js")).default
};
var zoraIcon = {
  iconBackground: "#000000",
  iconUrl: async () => (await import("./zora-FYL5H3IO.js")).default
};
var chainMetadataByName = {
  apechain: { chainId: 33139, name: "ApeChain", ...apeChainIcon },
  apechainCurtis: { chainId: 33111, name: "ApeChain Curtis", ...apeChainIcon },
  arbitrum: { chainId: 42161, name: "Arbitrum", ...arbitrumIcon },
  arbitrumGoerli: { chainId: 421613, ...arbitrumIcon },
  arbitrumSepolia: { chainId: 421614, ...arbitrumIcon },
  avalanche: { chainId: 43114, ...avalancheIcon },
  avalancheFuji: { chainId: 43113, ...avalancheIcon },
  base: { chainId: 8453, name: "Base", ...baseIcon },
  baseGoerli: { chainId: 84531, ...baseIcon },
  baseSepolia: { chainId: 84532, ...baseIcon },
  berachain: { chainId: 80094, name: "Berachain", ...berachainIcon },
  berachainArtio: { chainId: 80085, name: "Berachain Artio", ...berachainIcon },
  berachainBArtio: {
    chainId: 80084,
    name: "Berachain bArtio",
    ...berachainIcon
  },
  blast: { chainId: 81457, name: "Blast", ...blastIcon },
  blastSepolia: { chainId: 168587773, ...blastIcon },
  bsc: { chainId: 56, name: "BSC", ...bscIcon },
  bscTestnet: { chainId: 97, ...bscIcon },
  celo: { chainId: 42220, name: "Celo", ...celoIcon },
  celoAlfajores: { chainId: 44787, name: "Celo Alfajores", ...celoIcon },
  cronos: { chainId: 25, ...cronosIcon },
  cronosTestnet: { chainId: 338, ...cronosIcon },
  degen: { chainId: 666666666, name: "Degen", ...degenIcon },
  flow: { chainId: 747, ...flowIcon },
  flowTestnet: { chainId: 545, ...flowIcon },
  gnosis: { chainId: 100, name: "Gnosis", ...gnosisIcon },
  goerli: { chainId: 5, ...ethereumIcon },
  gravity: { chainId: 1625, name: "Gravity", ...gravityIcon },
  gravitySepolia: { chainId: 13505, name: "Gravity Sepolia", ...gravityIcon },
  hardhat: { chainId: 31337, ...hardhatIcon },
  holesky: { chainId: 17e3, ...ethereumIcon },
  hyperevm: { chainId: 999, ...hyperevmIcon },
  ink: { chainId: 57073, ...inkIcon },
  inkSepolia: { chainId: 763373, ...inkIcon },
  kaia: { chainId: 8217, name: "Kaia", ...kaiaIcon },
  kairos: { chainId: 1001, name: "Kairos", ...kaiaIcon },
  kovan: { chainId: 42, ...ethereumIcon },
  linea: { chainId: 59144, name: "Linea", ...lineaIcon },
  lineaGoerli: { chainId: 59140, name: "Linea Goerli", ...lineaIcon },
  lineaSepolia: { chainId: 59141, name: "Linea Sepolia", ...lineaIcon },
  localhost: { chainId: 1337, ...ethereumIcon },
  mainnet: { chainId: 1, name: "Ethereum", ...ethereumIcon },
  manta: { chainId: 169, name: "Manta", ...mantaIcon },
  mantaSepolia: { chainId: 3441006, ...mantaIcon },
  mantaTestnet: { chainId: 3441005, ...mantaIcon },
  mantle: { chainId: 5e3, ...mantleIcon },
  mantleTestnet: { chainId: 5001, ...mantleIcon },
  monadTestnet: { chainId: 10143, name: "Monad Testnet", ...monadTestnetIcon },
  optimism: { chainId: 10, name: "Optimism", ...optimismIcon },
  optimismGoerli: { chainId: 420, ...optimismIcon },
  optimismKovan: { chainId: 69, ...optimismIcon },
  optimismSepolia: { chainId: 11155420, ...optimismIcon },
  polygon: { chainId: 137, name: "Polygon", ...polygonIcon },
  polygonAmoy: { chainId: 80002, ...polygonIcon },
  polygonMumbai: { chainId: 80001, ...polygonIcon },
  rinkeby: { chainId: 4, ...ethereumIcon },
  ronin: { chainId: 2020, ...roninIcon },
  ropsten: { chainId: 3, ...ethereumIcon },
  sanko: { chainId: 1996, name: "Sanko", ...sankoIcon },
  scroll: { chainId: 534352, ...scrollIcon },
  scrollSepolia: { chainId: 534351, ...scrollIcon },
  sepolia: { chainId: 11155111, ...ethereumIcon },
  superposition: {
    chainId: 55244,
    name: "Superposition",
    ...superpositionIcon
  },
  unichain: { chainId: 130, ...unichainIcon },
  unichainSepolia: { chainId: 1301, ...unichainIcon },
  xdc: { chainId: 50, name: "XDC", ...xdcIcon },
  xdcTestnet: { chainId: 51, ...xdcIcon },
  zetachain: { chainId: 7e3, name: "ZetaChain", ...zetachainIcon },
  zetachainAthensTestnet: {
    chainId: 7001,
    name: "Zeta Athens",
    ...zetachainIcon
  },
  zkSync: { chainId: 324, name: "zkSync", ...zkSyncIcon },
  zkSyncTestnet: { chainId: 280, ...zkSyncIcon },
  zora: { chainId: 7777777, name: "Zora", ...zoraIcon },
  zoraSepolia: { chainId: 999999999, ...zoraIcon },
  zoraTestnet: { chainId: 999, ...zoraIcon }
};
var chainMetadataById = Object.fromEntries(
  Object.values(chainMetadataByName).filter(isNotNullish).map(({ chainId, ...metadata }) => [chainId, metadata])
);
var provideRainbowKitChains = (chains) => chains.map((chain) => {
  const defaultMetadata = chainMetadataById[chain.id] ?? {};
  return {
    ...chain,
    name: defaultMetadata.name ?? chain.name,
    // favor colloquial names
    iconUrl: chain.iconUrl ?? defaultMetadata.iconUrl,
    iconBackground: chain.iconBackground ?? defaultMetadata.iconBackground
  };
});

// src/components/RainbowKitProvider/RainbowKitChainContext.tsx
var RainbowKitChainContext = createContext4({
  chains: []
});
function RainbowKitChainProvider({
  children,
  initialChain
}) {
  const { chains } = useConfig();
  return /* @__PURE__ */ React9.createElement(
    RainbowKitChainContext.Provider,
    {
      value: useMemo5(
        () => ({
          chains: provideRainbowKitChains(chains),
          initialChainId: typeof initialChain === "number" ? initialChain : initialChain?.id
        }),
        [chains, initialChain]
      )
    },
    children
  );
}
var useRainbowKitChains = () => useContext3(RainbowKitChainContext).chains;
var useInitialChainId = () => useContext3(RainbowKitChainContext).initialChainId;
var useRainbowKitChainsById = () => {
  const rainbowkitChains = useRainbowKitChains();
  return useMemo5(() => {
    const rainbowkitChainsById = {};
    for (const rkChain of rainbowkitChains) {
      rainbowkitChainsById[rkChain.id] = rkChain;
    }
    return rainbowkitChainsById;
  }, [rainbowkitChains]);
};

// src/components/RainbowKitProvider/ShowBalanceContext.tsx
import React10, {
  createContext as createContext5,
  useContext as useContext4,
  useState as useState4
} from "react";
var ShowBalanceContext = createContext5({
  showBalance: void 0,
  setShowBalance: () => {
  }
});
function ShowBalanceProvider({ children }) {
  const [showBalance, setShowBalance] = useState4();
  return /* @__PURE__ */ React10.createElement(ShowBalanceContext.Provider, { value: { showBalance, setShowBalance } }, children);
}
var useShowBalance = () => useContext4(ShowBalanceContext);

// src/components/ConnectButton/ConnectButtonRenderer.tsx
import React59, { useContext as useContext21 } from "react";
import { useAccount as useAccount14, useConfig as useConfig4 } from "wagmi";

// src/hooks/useIsMounted.ts
import { useCallback, useEffect as useEffect5, useState as useState5 } from "react";
function useIsMounted() {
  const [isMounted, setIsMounted] = useState5(false);
  useEffect5(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);
  return useCallback(() => isMounted, [isMounted]);
}

// src/hooks/useProfile.ts
import { useBalance } from "wagmi";

// src/hooks/useMainnetEnsAvatar.ts
import { normalize } from "viem/ens";
import { useEnsAvatar } from "wagmi";
import { mainnet as mainnet2 } from "wagmi/chains";

// src/hooks/useIsMainnetConfigured.ts
import { mainnet } from "wagmi/chains";
function useIsMainnetConfigured() {
  const rainbowKitChains = useRainbowKitChains();
  const chainId = mainnet.id;
  const configured = rainbowKitChains.some(
    (rainbowKitChain) => rainbowKitChain.id === chainId
  );
  return configured;
}

// src/hooks/useMainnetEnsAvatar.ts
function useMainnetEnsAvatar(name) {
  const mainnetConfigured = useIsMainnetConfigured();
  const safeNormalize = (ensName) => {
    try {
      return normalize(ensName);
    } catch {
    }
  };
  const { data: ensAvatar } = useEnsAvatar({
    chainId: mainnet2.id,
    name: name ? safeNormalize(name) : void 0,
    query: {
      enabled: mainnetConfigured
    }
  });
  return ensAvatar;
}

// src/hooks/useMainnetEnsName.ts
import { useQuery } from "@tanstack/react-query";
import { useEnsName } from "wagmi";
import { mainnet as mainnet3 } from "wagmi/chains";

// src/core/network/internal/rainbowFetch.ts
async function rainbowFetch(url, opts) {
  opts = {
    headers: {},
    method: "get",
    ...opts,
    // Any other fetch options
    timeout: opts.timeout ?? 1e4
    // 10 secs
  };
  if (!url) throw new Error("rainbowFetch: Missing url argument");
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), opts.timeout);
  const { body, params, headers, ...otherOpts } = opts;
  const requestBody = body && typeof body === "object" ? JSON.stringify(opts.body) : opts.body;
  const response = await fetch(`${url}${createParams(params)}`, {
    ...otherOpts,
    body: requestBody,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
    },
    signal: controller.signal
  });
  clearTimeout(id);
  const responseBody = await getBody(response);
  if (response.ok) {
    const { headers: headers2, status } = response;
    return { data: responseBody, headers: headers2, status };
  }
  const errorResponseBody = typeof responseBody === "string" ? { error: responseBody } : responseBody;
  const error = generateError({
    requestBody: body,
    response,
    responseBody: errorResponseBody
  });
  throw error;
}
function getBody(response) {
  const contentType = response.headers.get("Content-Type");
  if (contentType?.startsWith("application/json")) {
    return response.json();
  }
  return response.text();
}
function createParams(params) {
  return params && Object.keys(params).length ? `?${new URLSearchParams(params)}` : "";
}
function generateError({
  requestBody,
  response,
  responseBody
}) {
  const message = responseBody?.error || response?.statusText || "There was an error with the request.";
  const error = new Error(message);
  error.response = response;
  error.responseBody = responseBody;
  error.requestBody = requestBody;
  return error;
}
var RainbowFetchClient = class {
  constructor(opts = {}) {
    const { baseUrl = "", ...otherOpts } = opts;
    this.baseUrl = baseUrl;
    this.opts = otherOpts;
  }
  /**
   * Perform a GET request with the RainbowFetchClient.
   */
  get(url, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      method: "get"
    });
  }
  /**
   * Perform a DELETE request with the RainbowFetchClient.
   */
  delete(url, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      method: "delete"
    });
  }
  /**
   * Perform a HEAD request with the RainbowFetchClient.
   */
  head(url, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      method: "head"
    });
  }
  /**
   * Perform a OPTIONS request with the RainbowFetchClient.
   */
  options(url, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      method: "options"
    });
  }
  /**
   * Perform a POST request with the RainbowFetchClient.
   */
  post(url, body, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      body,
      method: "post"
    });
  }
  /**
   * Perform a PUT request with the RainbowFetchClient.
   */
  put(url, body, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      body,
      method: "put"
    });
  }
  /**
   * Perform a PATCH request with the RainbowFetchClient.
   */
  patch(url, body, opts) {
    return rainbowFetch(`${this.baseUrl}${url}`, {
      ...this.opts,
      ...opts || {},
      body,
      method: "patch"
    });
  }
};

// src/core/network/internal/createHttpClient.ts
function createHttpClient({
  baseUrl,
  headers,
  params,
  timeout
}) {
  return new RainbowFetchClient({ baseUrl, headers, params, timeout });
}

// src/core/network/enhancedProvider.ts
var ENHANCED_PROVIDER_ENABLED = Boolean(
  typeof process !== "undefined" && typeof process.env !== "undefined" && process.env.RAINBOW_PROVIDER_API_KEY
);
var enhancedProviderHttp = createHttpClient({
  baseUrl: "https://enhanced-provider.rainbow.me",
  headers: {
    "x-api-key": typeof process !== "undefined" && typeof process.env !== "undefined" && process.env.RAINBOW_PROVIDER_API_KEY || "LzbasoBiLqltex3VkcQ7LRmL4PtfiiZ1EMJrizrgfonWN6byJReu/l6yrUoo3zLW"
  }
});

// src/core/react-query/createQuery.ts
function createQueryKey(key, args, config = {}) {
  return [key, args, config];
}

// src/utils/ens.ts
import { isAddress } from "viem";
function getStorageEnsNameKey(address) {
  return `rk-ens-name-${address}`;
}
function safeParseJsonData(string) {
  try {
    const value = string ? JSON.parse(string) : null;
    return typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}
function addEnsName(address, ensName) {
  if (!isAddress(address)) return;
  const now = /* @__PURE__ */ new Date();
  const expiry = new Date(now.getTime() + 180 * 6e4);
  localStorage.setItem(
    getStorageEnsNameKey(address),
    JSON.stringify({
      ensName,
      expires: expiry.getTime()
    })
  );
}
function getEnsName(address) {
  const data = safeParseJsonData(
    localStorage.getItem(getStorageEnsNameKey(address))
  );
  if (!data) return null;
  const { ensName, expires } = data;
  if (typeof ensName !== "string" || Number.isNaN(Number(expires))) {
    localStorage.removeItem(getStorageEnsNameKey(address));
    return null;
  }
  const now = /* @__PURE__ */ new Date();
  if (now.getTime() > Number(expires)) {
    localStorage.removeItem(getStorageEnsNameKey(address));
    return null;
  }
  return ensName;
}

// src/hooks/useMainnetEnsName.ts
async function getEnhancedProviderEnsName({ address }) {
  const ensName = getEnsName(address);
  if (ensName) return ensName;
  const response = await enhancedProviderHttp.get("/v1/resolve-ens", { params: { address } });
  const enhancedProviderEnsName = response.data.data;
  if (enhancedProviderEnsName) {
    addEnsName(address, enhancedProviderEnsName);
  }
  return enhancedProviderEnsName;
}
function useMainnetEnsName(address) {
  const mainnetConfigured = useIsMainnetConfigured();
  const { data: ensName } = useEnsName({
    chainId: mainnet3.id,
    address,
    query: {
      enabled: mainnetConfigured
    }
  });
  const { data: enhancedProviderEnsName } = useQuery({
    queryKey: createQueryKey("address", address),
    queryFn: () => getEnhancedProviderEnsName({ address }),
    enabled: !mainnetConfigured && !!address && ENHANCED_PROVIDER_ENABLED,
    staleTime: 10 * (60 * 1e3),
    // 10 minutes
    retry: 1
    // Retry once before returning undefined if the request fails
  });
  return ensName || enhancedProviderEnsName;
}

// src/hooks/useProfile.ts
function useProfile({ address, includeBalance }) {
  const ensName = useMainnetEnsName(address);
  const ensAvatar = useMainnetEnsAvatar(ensName);
  const { data: balance } = useBalance({
    address: includeBalance ? address : void 0
  });
  return { ensName, ensAvatar, balance };
}

// src/transactions/useRecentTransactions.ts
import { useEffect as useEffect6, useState as useState6 } from "react";
import { useAccount as useAccount5 } from "wagmi";

// src/hooks/useChainId.ts
import { useAccount as useAccount3 } from "wagmi";
function useChainId() {
  const { chain: activeChain } = useAccount3();
  return activeChain?.id ?? null;
}

// src/transactions/TransactionStoreContext.tsx
import React11 from "react";
import { useAccount as useAccount4, useBalance as useBalance2, usePublicClient } from "wagmi";

// src/transactions/transactionStore.ts
var storageKey = "rk-transactions";
function safeParseJsonData2(string) {
  try {
    const value = string ? JSON.parse(string) : {};
    return typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}
function loadData() {
  return safeParseJsonData2(
    typeof localStorage !== "undefined" ? localStorage.getItem(storageKey) : null
  );
}
var transactionHashRegex = /^0x([A-Fa-f0-9]{64})$/;
function validateTransaction(transaction) {
  const errors = [];
  if (!transactionHashRegex.test(transaction.hash)) {
    errors.push("Invalid transaction hash");
  }
  if (typeof transaction.description !== "string") {
    errors.push("Transaction must have a description");
  }
  if (typeof transaction.confirmations !== "undefined" && (!Number.isInteger(transaction.confirmations) || transaction.confirmations < 1)) {
    errors.push("Transaction confirmations must be a positiver integer");
  }
  return errors;
}
function createTransactionStore({
  provider: initialProvider
}) {
  let data = loadData();
  let provider = initialProvider;
  const listeners = /* @__PURE__ */ new Set();
  const transactionListeners = /* @__PURE__ */ new Set();
  const transactionRequestCache = /* @__PURE__ */ new Map();
  function setProvider(newProvider) {
    provider = newProvider;
  }
  function getTransactions(account, chainId) {
    return data[account]?.[chainId] ?? [];
  }
  function addTransaction(account, chainId, transaction) {
    const errors = validateTransaction(transaction);
    if (errors.length > 0) {
      throw new Error(["Unable to add transaction", ...errors].join("\n"));
    }
    updateTransactions(account, chainId, (transactions) => {
      return [
        { ...transaction, status: "pending" },
        ...transactions.filter(({ hash }) => {
          return hash !== transaction.hash;
        })
      ];
    });
  }
  function clearTransactions(account, chainId) {
    updateTransactions(account, chainId, () => {
      return [];
    });
  }
  function setTransactionStatus(account, chainId, hash, status) {
    updateTransactions(account, chainId, (transactions) => {
      return transactions.map(
        (transaction) => transaction.hash === hash ? { ...transaction, status } : transaction
      );
    });
  }
  async function waitForPendingTransactions(account, chainId) {
    await Promise.all(
      getTransactions(account, chainId).filter((transaction) => transaction.status === "pending").map(async (transaction) => {
        const { confirmations, hash } = transaction;
        const existingRequest = transactionRequestCache.get(hash);
        if (existingRequest) {
          return await existingRequest;
        }
        const requestPromise = provider.waitForTransactionReceipt({
          confirmations,
          hash,
          timeout: 3e5
          // 5 minutes
        }).then(({ status }) => {
          transactionRequestCache.delete(hash);
          if (status === void 0) {
            return;
          }
          setTransactionStatus(
            account,
            chainId,
            hash,
            // @ts-ignore - types changed with viem@1.1.0
            status === 0 || status === "reverted" ? "failed" : "confirmed"
          );
          notifyTransactionListeners(status);
        }).catch(() => {
          setTransactionStatus(account, chainId, hash, "failed");
        });
        transactionRequestCache.set(hash, requestPromise);
        return await requestPromise;
      })
    );
  }
  function updateTransactions(account, chainId, updateFn) {
    data = loadData();
    data[account] = data[account] ?? {};
    let completedTransactionCount = 0;
    const MAX_COMPLETED_TRANSACTIONS = 10;
    const transactions = updateFn(data[account][chainId] ?? []).filter(({ status }) => {
      return status === "pending" ? true : completedTransactionCount++ <= MAX_COMPLETED_TRANSACTIONS;
    });
    data[account][chainId] = transactions.length > 0 ? transactions : void 0;
    persistData();
    notifyListeners();
    waitForPendingTransactions(account, chainId);
  }
  function persistData() {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }
  function notifyListeners() {
    for (const listener of listeners) {
      listener();
    }
  }
  function notifyTransactionListeners(txStatus) {
    for (const transactionListener of transactionListeners) {
      transactionListener(txStatus);
    }
  }
  function onChange(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }
  function onTransactionStatus(fn) {
    transactionListeners.add(fn);
    return () => {
      transactionListeners.delete(fn);
    };
  }
  return {
    addTransaction,
    clearTransactions,
    getTransactions,
    onTransactionStatus,
    onChange,
    setProvider,
    waitForPendingTransactions
  };
}

// src/transactions/TransactionStoreContext.tsx
var storeSingleton;
var TransactionStoreContext = React11.createContext(
  null
);
function TransactionStoreProvider({
  children
}) {
  const provider = usePublicClient();
  const { address } = useAccount4();
  const chainId = useChainId();
  const { refetch } = useBalance2({
    address,
    query: {
      enabled: false
    }
  });
  const [store] = React11.useState(
    () => storeSingleton ?? (storeSingleton = createTransactionStore({ provider }))
  );
  const onTransactionStatus = React11.useCallback(
    (txStatus) => {
      if (txStatus === "success") refetch();
    },
    [refetch]
  );
  React11.useEffect(() => {
    store.setProvider(provider);
  }, [store, provider]);
  React11.useEffect(() => {
    if (address && chainId) {
      store.waitForPendingTransactions(address, chainId);
    }
  }, [store, address, chainId]);
  React11.useEffect(() => {
    if (store && address && chainId) {
      return store.onTransactionStatus(onTransactionStatus);
    }
  }, [store, address, chainId, onTransactionStatus]);
  return /* @__PURE__ */ React11.createElement(TransactionStoreContext.Provider, { value: store }, children);
}
function useTransactionStore() {
  const store = React11.useContext(TransactionStoreContext);
  if (!store) {
    throw new Error("Transaction hooks must be used within RainbowKitProvider");
  }
  return store;
}

// src/transactions/useRecentTransactions.ts
function useRecentTransactions() {
  const store = useTransactionStore();
  const { address } = useAccount5();
  const chainId = useChainId();
  const [transactions, setTransactions] = useState6(
    () => store && address && chainId ? store.getTransactions(address, chainId) : []
  );
  useEffect6(() => {
    if (store && address && chainId) {
      setTransactions(store.getTransactions(address, chainId));
      return store.onChange(() => {
        setTransactions(store.getTransactions(address, chainId));
      });
    }
  }, [store, address, chainId]);
  return transactions;
}

// src/components/RainbowKitProvider/ModalContext.tsx
import React58, {
  createContext as createContext12,
  useCallback as useCallback10,
  useContext as useContext20,
  useEffect as useEffect17,
  useMemo as useMemo7,
  useState as useState14
} from "react";
import { useAccount as useAccount13, useAccountEffect as useAccountEffect3, useConfig as useConfig3 } from "wagmi";

// src/components/AccountModal/AccountModal.tsx
import React35 from "react";
import { useAccount as useAccount10, useDisconnect } from "wagmi";

// src/components/Dialog/Dialog.tsx
import React23, {
  useCallback as useCallback6,
  useEffect as useEffect11,
  useState as useState9
} from "react";
import { createPortal } from "react-dom";
import { RemoveScroll } from "react-remove-scroll";

// src/components/RainbowKitProvider/RainbowKitProvider.tsx
import React21, { createContext as createContext11, useContext as useContext7 } from "react";
import { useAccountEffect as useAccountEffect2 } from "wagmi";

// src/css/cssObjectFromTheme.ts
import { assignInlineVars } from "@vanilla-extract/dynamic";
var resolveThemeVars = (theme) => typeof theme === "function" ? theme() : theme;
function cssObjectFromTheme(theme, { extends: baseTheme } = {}) {
  const resolvedThemeVars = {
    // We use an object spread here to ensure it's a plain object since vanilla-extract's
    // var objects have a custom 'toString' method that returns a CSS string, but we don't
    // want to leak this to our consumers since they're unaware we're using vanilla-extract.
    // Instead, we want them to handle this explicitly via our 'cssStringFromTheme' function.
    ...assignInlineVars(themeVars, resolveThemeVars(theme))
  };
  if (!baseTheme) {
    return resolvedThemeVars;
  }
  const resolvedBaseThemeVars = assignInlineVars(
    themeVars,
    resolveThemeVars(baseTheme)
  );
  const filteredVars = Object.fromEntries(
    Object.entries(resolvedThemeVars).filter(
      ([varName, value]) => value !== resolvedBaseThemeVars[varName]
    )
  );
  return filteredVars;
}

// src/css/cssStringFromTheme.ts
function cssStringFromTheme(theme, options = {}) {
  return Object.entries(cssObjectFromTheme(theme, options)).map(([key, value]) => `${key}:${value.replace(/[:;{}</>]/g, "")};`).join("");
}

// src/components/RainbowKitProvider/AppContext.ts
import { createContext as createContext6 } from "react";
var defaultAppInfo = {
  appName: void 0,
  disclaimer: void 0,
  learnMoreUrl: "https://learn.rainbow.me/understanding-web3?utm_source=rainbowkit&utm_campaign=learnmore"
};
var AppContext = createContext6(defaultAppInfo);

// src/components/RainbowKitProvider/CoolModeContext.ts
import { createContext as createContext7 } from "react";
var CoolModeContext = createContext7(false);

// src/components/RainbowKitProvider/ModalSizeContext.tsx
import React13, { createContext as createContext9, useContext as useContext5 } from "react";

// src/hooks/useWindowSize.ts
import { useEffect as useEffect7, useState as useState7 } from "react";

// src/utils/debounce.ts
function debounce(fn, ms) {
  let timer;
  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, ms);
  };
}

// src/hooks/useWindowSize.ts
var useWindowSize = () => {
  const [windowSize, setWindowSize] = useState7({
    height: void 0,
    width: void 0
  });
  useEffect7(() => {
    const handleResize = debounce(() => {
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth
      });
    }, 500);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
};

// src/components/RainbowKitProvider/WalletButtonContext.tsx
import React12, { createContext as createContext8, useMemo as useMemo6, useState as useState8 } from "react";
var WalletButtonContext = createContext8({
  connector: null,
  setConnector: () => {
  }
});
function WalletButtonProvider({ children }) {
  const [connector, setConnector] = useState8(null);
  return /* @__PURE__ */ React12.createElement(
    WalletButtonContext.Provider,
    {
      value: useMemo6(
        () => ({
          connector,
          setConnector
        }),
        [connector]
      )
    },
    children
  );
}

// src/components/RainbowKitProvider/ModalSizeContext.tsx
var ModalSizeOptions = {
  COMPACT: "compact",
  WIDE: "wide"
};
var ModalSizeContext = createContext9(
  ModalSizeOptions.WIDE
);
function ModalSizeProvider({
  children,
  modalSize
}) {
  const { width } = useWindowSize();
  const isSmallScreen = width && width < largeScreenMinWidth;
  const { connector } = useContext5(WalletButtonContext);
  return /* @__PURE__ */ React13.createElement(
    ModalSizeContext.Provider,
    {
      value: isSmallScreen || connector ? ModalSizeOptions.COMPACT : modalSize
    },
    children
  );
}

// src/components/RainbowKitProvider/ShowRecentTransactionsContext.ts
import { createContext as createContext10 } from "react";
var ShowRecentTransactionsContext = createContext10(false);

// src/components/RainbowKitProvider/useFingerprint.ts
import { useCallback as useCallback2, useEffect as useEffect8 } from "react";
var storageKey2 = "rk-version";
function setRainbowKitVersion({ version }) {
  localStorage.setItem(storageKey2, version);
}
function useFingerprint() {
  const fingerprint = useCallback2(() => {
    setRainbowKitVersion({ version: "2.2.10" });
  }, []);
  useEffect8(() => {
    fingerprint();
  }, [fingerprint]);
}

// src/components/RainbowKitProvider/usePreloadImages.ts
import { useCallback as useCallback4, useEffect as useEffect9 } from "react";

// src/wallets/useWalletConnectors.ts
import { useConnect } from "wagmi";

// src/utils/indexBy.ts
function indexBy(items, getKey) {
  const indexedItems = {};
  for (const item of items) {
    const key = getKey(item);
    if (!key) {
      continue;
    }
    indexedItems[key] = item;
  }
  return indexedItems;
}

// src/utils/browsers.ts
function isSafari() {
  return typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined" && /Version\/([0-9._]+).*Safari/.test(navigator.userAgent);
}
function isArc() {
  return typeof document !== "undefined" && getComputedStyle(document.body).getPropertyValue("--arc-palette-focus") !== "";
}
function getBrowser() {
  if (typeof navigator === "undefined") return "Browser" /* Browser */;
  const ua2 = navigator.userAgent?.toLowerCase();
  if (navigator.brave?.isBrave) return "Brave" /* Brave */;
  if (ua2?.indexOf("edg/") > -1) return "Edge" /* Edge */;
  if (ua2?.indexOf("op") > -1) return "Opera" /* Opera */;
  if (isArc()) return "Arc" /* Arc */;
  if (ua2?.indexOf("chrome") > -1) return "Chrome" /* Chrome */;
  if (ua2?.indexOf("firefox") > -1) return "Firefox" /* Firefox */;
  if (isSafari()) return "Safari" /* Safari */;
  return "Browser" /* Browser */;
}

// src/utils/platforms.ts
import { UAParser } from "ua-parser-js";
var ua = UAParser();
var { os } = ua;
function isWindows() {
  return os.name === "Windows";
}
function isMacOS() {
  return os.name === "Mac OS";
}
function isLinux() {
  return ["Ubuntu", "Mint", "Fedora", "Debian", "Arch", "Linux"].includes(
    os.name
  );
}
function getPlatform() {
  if (isWindows()) return "Windows" /* Windows */;
  if (isMacOS()) return "macOS" /* MacOS */;
  if (isLinux()) return "Linux" /* Linux */;
  return "Desktop" /* Desktop */;
}

// src/wallets/downloadUrls.ts
var getExtensionDownloadUrl = (wallet) => {
  const browser = getBrowser();
  return {
    ["Arc" /* Arc */]: wallet?.downloadUrls?.chrome,
    ["Brave" /* Brave */]: wallet?.downloadUrls?.chrome,
    ["Chrome" /* Chrome */]: wallet?.downloadUrls?.chrome,
    ["Edge" /* Edge */]: wallet?.downloadUrls?.edge || wallet?.downloadUrls?.chrome,
    ["Firefox" /* Firefox */]: wallet?.downloadUrls?.firefox,
    ["Opera" /* Opera */]: wallet?.downloadUrls?.opera || wallet?.downloadUrls?.chrome,
    ["Safari" /* Safari */]: wallet?.downloadUrls?.safari,
    ["Browser" /* Browser */]: wallet?.downloadUrls?.browserExtension
  }[browser] ?? wallet?.downloadUrls?.browserExtension;
};
var getMobileDownloadUrl = (wallet) => {
  const ios = isIOS();
  return (ios ? wallet?.downloadUrls?.ios : wallet?.downloadUrls?.android) ?? wallet?.downloadUrls?.mobile;
};
var getDesktopDownloadUrl = (wallet) => {
  const platform = getPlatform();
  return {
    ["Windows" /* Windows */]: wallet?.downloadUrls?.windows,
    ["macOS" /* MacOS */]: wallet?.downloadUrls?.macos,
    ["Linux" /* Linux */]: wallet?.downloadUrls?.linux,
    ["Desktop" /* Desktop */]: wallet?.downloadUrls?.desktop
  }[platform] ?? wallet?.downloadUrls?.desktop;
};

// src/wallets/groupedWallets.ts
var isRecentWallet = (recentWallets, walletId) => {
  return recentWallets.some((recentWallet) => recentWallet.id === walletId);
};
var isRainbowKitConnector = (wallet) => {
  return !!wallet.isRainbowKitConnector;
};
var isEIP6963Connector = (wallet) => {
  return !!(!wallet.isRainbowKitConnector && wallet.icon?.replace(/\n/g, "").startsWith("data:image") && wallet.uid && wallet.name);
};
var rainbowKitConnectorWithWalletConnect = (wallet, walletConnectModalConnector) => {
  const shouldUseWalletConnectModal = wallet.id === "walletConnect" && walletConnectModalConnector;
  return shouldUseWalletConnectModal ? { ...wallet, walletConnectModalConnector } : wallet;
};
var connectorsWithRecentWallets = ({
  wallets,
  recentWallets
}) => {
  return [
    ...recentWallets,
    ...wallets.filter((wallet) => !isRecentWallet(recentWallets, wallet.id))
  ];
};

// src/wallets/recentWalletIds.ts
var storageKey3 = "rk-recent";
function safeParseJsonArray(string) {
  try {
    const value = string ? JSON.parse(string) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function getRecentWalletIds() {
  return typeof localStorage !== "undefined" ? safeParseJsonArray(localStorage.getItem(storageKey3)) : [];
}
function dedupe(array) {
  return [...new Set(array)];
}
function addRecentWalletId(walletId) {
  const newValue = dedupe([walletId, ...getRecentWalletIds()]);
  localStorage.setItem(storageKey3, JSON.stringify(newValue));
}

// src/wallets/useWalletConnectors.ts
function useWalletConnectors(mergeEIP6963WithRkConnectors = false) {
  const rainbowKitChains = useRainbowKitChains();
  const intialChainId = useInitialChainId();
  const { connectAsync, connectors: defaultConnectors_untyped } = useConnect();
  const defaultCreatedConnectors = defaultConnectors_untyped;
  const { setIsWalletConnectModalOpen } = useWalletConnectOpenState();
  const defaultConnectors = defaultCreatedConnectors.map((connector) => ({
    ...connector,
    // rkDetails is optional it does not exist in eip6963 connectors.
    // We only inject `rkDetails` in `connectorsForWallets` when we
    // want to have additional information in the connector.
    ...connector.rkDetails || {}
  }));
  async function connectWallet(connector, parameters) {
    const walletChainId = await connector.getChainId();
    const result = await connectAsync({
      ...parameters,
      chainId: parameters?.chainId ?? // The goal here is to ensure users are always on a supported chain when connecting.
      // If an `initialChain` prop was provided to RainbowKitProvider, use that.
      intialChainId ?? // Otherwise, if the wallet is already on a supported chain, use that to avoid a chain switch prompt.
      rainbowKitChains.find(({ id }) => id === walletChainId)?.id ?? // Finally, fall back to the first chain provided to RainbowKitProvider.
      rainbowKitChains[0]?.id,
      connector
    });
    if (result) {
      addRecentWalletId(connector.id);
    }
    return result;
  }
  async function connectToWalletConnectModal(walletConnectModalConnector2) {
    try {
      setIsWalletConnectModalOpen(true);
      await connectWallet(walletConnectModalConnector2);
      setIsWalletConnectModalOpen(false);
    } catch (err) {
      const isUserRejection = (
        // @ts-expect-error - Web3Modal v1 error name
        err.name === "UserRejectedRequestError" || // @ts-expect-error - Web3Modal v2 error message on desktop
        err.message === "Connection request reset. Please try again."
      );
      setIsWalletConnectModalOpen(false);
      if (!isUserRejection) {
        throw err;
      }
    }
  }
  const getWalletConnectUri = async (connector, uriConverter) => {
    const provider = await connector.getProvider();
    if (connector.id === "coinbase") {
      return provider.qrUrl;
    }
    return new Promise(
      (resolve) => (
        // Wagmi v2 doesn't have a return type for provider yet
        // @ts-expect-error
        provider.once("display_uri", (uri) => {
          resolve(uriConverter(uri));
        })
      )
    );
  };
  const walletConnectModalConnector = defaultConnectors.find(
    (connector) => connector.id === "walletConnect" && connector.isWalletConnectModalConnector
  );
  const eip6963Connectors = defaultConnectors.filter(isEIP6963Connector).map((connector) => {
    return {
      ...connector,
      groupIndex: 0
    };
  });
  const rainbowKitConnectors = defaultConnectors.filter(isRainbowKitConnector).filter((wallet) => !wallet.isWalletConnectModalConnector).filter((wallet) => {
    if (!mergeEIP6963WithRkConnectors) return true;
    const existsInEIP6963Connectors = eip6963Connectors.some(
      (eip6963) => eip6963.id === wallet.rdns
    );
    return !existsInEIP6963Connectors;
  }).map(
    (wallet) => rainbowKitConnectorWithWalletConnect(
      wallet,
      walletConnectModalConnector
    )
  );
  const combinedConnectors = [...eip6963Connectors, ...rainbowKitConnectors];
  const walletInstanceById = indexBy(
    combinedConnectors,
    (walletInstance) => walletInstance.id
  );
  const MAX_RECENT_WALLETS = 3;
  const recentWallets = getRecentWalletIds().map((walletId) => walletInstanceById[walletId]).filter(Boolean).slice(0, MAX_RECENT_WALLETS);
  const walletConnectors = [];
  const combinedConnectorsWithRecentWallets = connectorsWithRecentWallets({
    wallets: combinedConnectors,
    recentWallets
  });
  for (const wallet of combinedConnectorsWithRecentWallets) {
    if (!wallet) continue;
    const eip6963 = isEIP6963Connector(wallet);
    const recent = isRecentWallet(recentWallets, wallet.id);
    if (eip6963) {
      walletConnectors.push({
        ...wallet,
        iconUrl: wallet.icon,
        ready: true,
        connect: connectWallet.bind(null, wallet),
        groupName: "Installed",
        recent
      });
      continue;
    }
    walletConnectors.push({
      ...wallet,
      ready: wallet.installed ?? true,
      connect: connectWallet.bind(null, wallet),
      desktopDownloadUrl: getDesktopDownloadUrl(wallet),
      extensionDownloadUrl: getExtensionDownloadUrl(wallet),
      groupName: wallet.groupName,
      mobileDownloadUrl: getMobileDownloadUrl(wallet),
      getQrCodeUri: wallet.qrCode?.getUri ? () => getWalletConnectUri(wallet, wallet.qrCode.getUri) : void 0,
      getDesktopUri: wallet.desktop?.getUri ? () => getWalletConnectUri(wallet, wallet.desktop.getUri) : void 0,
      getMobileUri: wallet.mobile?.getUri ? () => getWalletConnectUri(wallet, wallet.mobile?.getUri) : void 0,
      recent,
      showWalletConnectModal: wallet.walletConnectModalConnector ? () => connectToWalletConnectModal(wallet.walletConnectModalConnector) : void 0
    });
  }
  return walletConnectors;
}

// src/components/Icons/Assets.tsx
import React14 from "react";
var src = async () => (await import("./assets-Q6ZU7ZJ5.js")).default;
var preloadAssetsIcon = () => loadImages(src);
var AssetsIcon = () => /* @__PURE__ */ React14.createElement(
  AsyncImage,
  {
    background: "#d0d5de",
    borderRadius: "10",
    height: "48",
    src,
    width: "48"
  }
);

// src/components/Icons/Login.tsx
import React15 from "react";
var src2 = async () => (await import("./login-UP3DZBGS.js")).default;
var preloadLoginIcon = () => loadImages(src2);
var LoginIcon = () => /* @__PURE__ */ React15.createElement(
  AsyncImage,
  {
    background: "#d0d5de",
    borderRadius: "10",
    height: "48",
    src: src2,
    width: "48"
  }
);

// src/components/SignIn/SignIn.tsx
import React20, { useCallback as useCallback3, useContext as useContext6, useRef } from "react";
import { UserRejectedRequestError } from "viem";
import { useAccount as useAccount6, useSignMessage } from "wagmi";

// src/components/Button/ActionButton.tsx
import React17 from "react";

// src/components/Text/Text.tsx
import React16 from "react";
var Text = React16.forwardRef(
  ({
    as = "div",
    children,
    className,
    color,
    display,
    font = "body",
    id,
    size = "16",
    style,
    tabIndex,
    textAlign = "inherit",
    weight = "regular",
    testId
  }, ref) => {
    return /* @__PURE__ */ React16.createElement(
      Box,
      {
        as,
        className,
        color,
        display,
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        id,
        ref,
        style,
        tabIndex,
        textAlign,
        testId
      },
      children
    );
  }
);
Text.displayName = "Text";

// src/components/Button/ActionButton.tsx
var sizeVariants = {
  large: {
    fontSize: "16",
    paddingX: "24",
    paddingY: "10"
  },
  medium: {
    fontSize: "14",
    height: "28",
    paddingX: "12",
    paddingY: "4"
  },
  small: {
    fontSize: "14",
    paddingX: "10",
    paddingY: "5"
  }
};
function ActionButton({
  disabled = false,
  href,
  label,
  onClick,
  rel = "noreferrer noopener",
  size = "medium",
  target = "_blank",
  testId,
  type = "primary"
}) {
  const isPrimary = type === "primary";
  const isNotLarge = size !== "large";
  const mobile = isMobile();
  const background = !disabled ? isPrimary ? "accentColor" : isNotLarge ? "actionButtonSecondaryBackground" : null : "actionButtonSecondaryBackground";
  const { fontSize, height, paddingX, paddingY } = sizeVariants[size];
  const hasBorder = !mobile || !isNotLarge;
  return /* @__PURE__ */ React17.createElement(
    Box,
    {
      ...href ? !disabled ? { as: "a", href, rel, target } : {} : { as: "button", type: "button" },
      onClick: !disabled ? onClick : void 0,
      ...hasBorder ? {
        borderColor: mobile && !isNotLarge && !isPrimary ? "actionButtonBorderMobile" : "actionButtonBorder",
        borderStyle: "solid",
        borderWidth: "1"
      } : {},
      borderRadius: "actionButton",
      className: !disabled && touchableStyles({ active: "shrinkSm", hover: "grow" }),
      display: "block",
      paddingX,
      paddingY,
      style: { willChange: "transform" },
      testId,
      textAlign: "center",
      transition: "transform",
      ...background ? { background } : {},
      ...height ? { height } : {}
    },
    /* @__PURE__ */ React17.createElement(
      Text,
      {
        color: !disabled ? isPrimary ? "accentColorForeground" : "accentColor" : "modalTextSecondary",
        size: fontSize,
        weight: "bold"
      },
      label
    )
  );
}

// src/components/CloseButton/CloseButton.tsx
import React19 from "react";

// src/components/Icons/Close.tsx
import React18 from "react";
var CloseIcon = () => {
  return isMobile() ? /* @__PURE__ */ React18.createElement(
    "svg",
    {
      "aria-hidden": true,
      fill: "none",
      height: "11.5",
      viewBox: "0 0 11.5 11.5",
      width: "11.5",
      xmlns: "http://www.w3.org/2000/svg"
    },
    /* @__PURE__ */ React18.createElement("title", null, "Close"),
    /* @__PURE__ */ React18.createElement(
      "path",
      {
        d: "M2.13388 0.366117C1.64573 -0.122039 0.854272 -0.122039 0.366117 0.366117C-0.122039 0.854272 -0.122039 1.64573 0.366117 2.13388L3.98223 5.75L0.366117 9.36612C-0.122039 9.85427 -0.122039 10.6457 0.366117 11.1339C0.854272 11.622 1.64573 11.622 2.13388 11.1339L5.75 7.51777L9.36612 11.1339C9.85427 11.622 10.6457 11.622 11.1339 11.1339C11.622 10.6457 11.622 9.85427 11.1339 9.36612L7.51777 5.75L11.1339 2.13388C11.622 1.64573 11.622 0.854272 11.1339 0.366117C10.6457 -0.122039 9.85427 -0.122039 9.36612 0.366117L5.75 3.98223L2.13388 0.366117Z",
        fill: "currentColor"
      }
    )
  ) : /* @__PURE__ */ React18.createElement(
    "svg",
    {
      "aria-hidden": true,
      fill: "none",
      height: "10",
      viewBox: "0 0 10 10",
      width: "10",
      xmlns: "http://www.w3.org/2000/svg"
    },
    /* @__PURE__ */ React18.createElement("title", null, "Close"),
    /* @__PURE__ */ React18.createElement(
      "path",
      {
        d: "M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z",
        fill: "currentColor"
      }
    )
  );
};

// src/components/CloseButton/CloseButton.tsx
var CloseButton = ({
  "aria-label": ariaLabel = "Close",
  onClose
}) => {
  const mobile = isMobile();
  return /* @__PURE__ */ React19.createElement(
    Box,
    {
      alignItems: "center",
      "aria-label": ariaLabel,
      as: "button",
      background: "closeButtonBackground",
      borderColor: "actionButtonBorder",
      borderRadius: "full",
      borderStyle: "solid",
      borderWidth: mobile ? "0" : "1",
      className: touchableStyles({ active: "shrinkSm", hover: "growLg" }),
      color: "closeButton",
      display: "flex",
      height: mobile ? "30" : "28",
      justifyContent: "center",
      onClick: onClose,
      style: { willChange: "transform" },
      transition: "default",
      type: "button",
      width: mobile ? "30" : "28"
    },
    /* @__PURE__ */ React19.createElement(CloseIcon, null)
  );
};

// src/components/SignIn/SignIn.tsx
var signInIcon = async () => (await import("./sign-A7IJEUT5.js")).default;
function SignIn({
  onClose,
  onCloseModal
}) {
  const { i18n: i18n2 } = useContext6(I18nContext);
  const [{ status, ...state }, setState] = React20.useState({ status: "idle" });
  const authAdapter = useAuthenticationAdapter();
  const getNonce = useCallback3(async () => {
    try {
      const nonce = await authAdapter.getNonce();
      setState((x) => ({ ...x, nonce }));
    } catch {
      setState((x) => ({
        ...x,
        errorMessage: i18n2.t("sign_in.message.preparing_error"),
        status: "idle"
      }));
    }
  }, [authAdapter, i18n2.t]);
  const onceRef = useRef(false);
  React20.useEffect(() => {
    if (onceRef.current) return;
    onceRef.current = true;
    getNonce();
  }, [getNonce]);
  const mobile = isMobile();
  const { address, chain: activeChain } = useAccount6();
  const { signMessageAsync } = useSignMessage();
  const signIn = async () => {
    try {
      const chainId = activeChain?.id;
      const { nonce } = state;
      if (!address || !chainId || !nonce) {
        return;
      }
      setState((x) => ({
        ...x,
        errorMessage: void 0,
        status: "signing"
      }));
      const message = authAdapter.createMessage({ address, chainId, nonce });
      let signature;
      try {
        signature = await signMessageAsync({
          message
        });
      } catch (error) {
        if (error instanceof UserRejectedRequestError) {
          return setState((x) => ({
            ...x,
            status: "idle"
          }));
        }
        return setState((x) => ({
          ...x,
          errorMessage: i18n2.t("sign_in.signature.signing_error"),
          status: "idle"
        }));
      }
      setState((x) => ({ ...x, status: "verifying" }));
      try {
        const verified = await authAdapter.verify({ message, signature });
        if (verified) {
          onCloseModal();
          return;
        }
        throw new Error();
      } catch {
        return setState((x) => ({
          ...x,
          errorMessage: i18n2.t("sign_in.signature.verifying_error"),
          status: "idle"
        }));
      }
    } catch {
      setState({
        errorMessage: i18n2.t("sign_in.signature.oops_error"),
        status: "idle"
      });
    }
  };
  return /* @__PURE__ */ React20.createElement(Box, { position: "relative" }, /* @__PURE__ */ React20.createElement(
    Box,
    {
      display: "flex",
      paddingRight: "16",
      paddingTop: "16",
      position: "absolute",
      right: "0"
    },
    /* @__PURE__ */ React20.createElement(CloseButton, { onClose })
  ), /* @__PURE__ */ React20.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: mobile ? "32" : "24",
      padding: "24",
      paddingX: "18",
      style: { paddingTop: mobile ? "60px" : "36px" }
    },
    /* @__PURE__ */ React20.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: mobile ? "6" : "4",
        style: { maxWidth: mobile ? 320 : 280 }
      },
      /* @__PURE__ */ React20.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: mobile ? "32" : "16"
        },
        /* @__PURE__ */ React20.createElement(AsyncImage, { height: 40, src: signInIcon, width: 40 }),
        /* @__PURE__ */ React20.createElement(
          Text,
          {
            color: "modalText",
            size: mobile ? "20" : "18",
            textAlign: "center",
            weight: "heavy"
          },
          i18n2.t("sign_in.label")
        )
      ),
      /* @__PURE__ */ React20.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: mobile ? "16" : "12"
        },
        /* @__PURE__ */ React20.createElement(
          Text,
          {
            color: "modalTextSecondary",
            size: mobile ? "16" : "14",
            textAlign: "center"
          },
          i18n2.t("sign_in.description")
        ),
        status === "idle" && state.errorMessage ? /* @__PURE__ */ React20.createElement(
          Text,
          {
            color: "error",
            size: mobile ? "16" : "14",
            textAlign: "center",
            weight: "bold"
          },
          state.errorMessage
        ) : null
      )
    ),
    /* @__PURE__ */ React20.createElement(
      Box,
      {
        alignItems: !mobile ? "center" : void 0,
        display: "flex",
        flexDirection: "column",
        gap: "8",
        width: "full"
      },
      /* @__PURE__ */ React20.createElement(
        ActionButton,
        {
          disabled: !state.nonce || status === "signing" || status === "verifying",
          label: !state.nonce ? i18n2.t("sign_in.message.preparing") : status === "signing" ? i18n2.t("sign_in.signature.waiting") : status === "verifying" ? i18n2.t("sign_in.signature.verifying") : i18n2.t("sign_in.message.send"),
          onClick: signIn,
          size: mobile ? "large" : "medium",
          testId: "auth-message-button"
        }
      ),
      mobile ? /* @__PURE__ */ React20.createElement(
        ActionButton,
        {
          label: "Cancel",
          onClick: onClose,
          size: "large",
          type: "secondary"
        }
      ) : /* @__PURE__ */ React20.createElement(
        Box,
        {
          as: "button",
          borderRadius: "full",
          className: touchableStyles({ active: "shrink", hover: "grow" }),
          display: "block",
          onClick: onClose,
          paddingX: "10",
          paddingY: "5",
          rel: "noreferrer",
          style: { willChange: "transform" },
          target: "_blank",
          transition: "default"
        },
        /* @__PURE__ */ React20.createElement(
          Text,
          {
            color: "closeButton",
            size: mobile ? "16" : "14",
            weight: "bold"
          },
          i18n2.t("sign_in.message.cancel")
        )
      )
    )
  ));
}

// src/components/RainbowKitProvider/usePreloadImages.ts
function usePreloadImages() {
  const rainbowKitChains = useRainbowKitChains();
  const walletConnectors = useWalletConnectors();
  const isUnauthenticated = useAuthenticationStatus() === "unauthenticated";
  const preloadImages = useCallback4(() => {
    loadImages(
      ...walletConnectors.map((wallet) => wallet.iconUrl),
      ...rainbowKitChains.map((chain) => chain.iconUrl).filter(isNotNullish)
    );
    if (!isMobile()) {
      preloadAssetsIcon();
      preloadLoginIcon();
    }
    if (isUnauthenticated) {
      loadImages(signInIcon);
    }
  }, [walletConnectors, rainbowKitChains, isUnauthenticated]);
  useEffect9(() => {
    preloadImages();
  }, [preloadImages]);
}

// src/components/RainbowKitProvider/walletConnectDeepLink.ts
var storageKey4 = "WALLETCONNECT_DEEPLINK_CHOICE";
function setWalletConnectDeepLink({
  mobileUri,
  name
}) {
  localStorage.setItem(
    storageKey4,
    JSON.stringify({
      href: mobileUri.split("?")[0],
      name
    })
  );
}
function clearWalletConnectDeepLink() {
  localStorage.removeItem(storageKey4);
}

// src/components/RainbowKitProvider/RainbowKitProvider.tsx
var ThemeIdContext = createContext11(void 0);
var attr = "data-rk";
var createThemeRootProps = (id) => ({ [attr]: id || "" });
var createThemeRootSelector = (id) => {
  if (id && !/^[a-zA-Z0-9_]+$/.test(id)) {
    throw new Error(`Invalid ID: ${id}`);
  }
  return id ? `[${attr}="${id}"]` : `[${attr}]`;
};
var useThemeRootProps = () => {
  const id = useContext7(ThemeIdContext);
  return createThemeRootProps(id);
};
var defaultTheme = lightTheme();
function RainbowKitProvider({
  appInfo,
  avatar,
  children,
  coolMode = false,
  id,
  initialChain,
  locale,
  modalSize = ModalSizeOptions.WIDE,
  showRecentTransactions = false,
  theme = defaultTheme
}) {
  usePreloadImages();
  useFingerprint();
  useAccountEffect2({ onDisconnect: clearWalletConnectDeepLink });
  if (typeof theme === "function") {
    throw new Error(
      'A theme function was provided to the "theme" prop instead of a theme object. You must execute this function to get the resulting theme object.'
    );
  }
  const selector = createThemeRootSelector(id);
  const appContext = {
    ...defaultAppInfo,
    ...appInfo
  };
  const avatarContext = avatar ?? defaultAvatar;
  return /* @__PURE__ */ React21.createElement(RainbowKitChainProvider, { initialChain }, /* @__PURE__ */ React21.createElement(WalletButtonProvider, null, /* @__PURE__ */ React21.createElement(I18nProvider, { locale }, /* @__PURE__ */ React21.createElement(CoolModeContext.Provider, { value: coolMode }, /* @__PURE__ */ React21.createElement(ModalSizeProvider, { modalSize }, /* @__PURE__ */ React21.createElement(
    ShowRecentTransactionsContext.Provider,
    {
      value: showRecentTransactions
    },
    /* @__PURE__ */ React21.createElement(TransactionStoreProvider, null, /* @__PURE__ */ React21.createElement(AvatarContext.Provider, { value: avatarContext }, /* @__PURE__ */ React21.createElement(AppContext.Provider, { value: appContext }, /* @__PURE__ */ React21.createElement(ThemeIdContext.Provider, { value: id }, /* @__PURE__ */ React21.createElement(ShowBalanceProvider, null, /* @__PURE__ */ React21.createElement(ModalProvider, null, theme ? /* @__PURE__ */ React21.createElement("div", { ...createThemeRootProps(id) }, /* @__PURE__ */ React21.createElement(
      "style",
      {
        dangerouslySetInnerHTML: {
          // Selectors are sanitized to only contain alphanumeric
          // and underscore characters. Theme values generated by
          // cssStringFromTheme are sanitized, removing
          // characters that terminate values / HTML tags.
          __html: [
            `${selector}{${cssStringFromTheme(
              "lightMode" in theme ? theme.lightMode : theme
            )}}`,
            "darkMode" in theme ? `@media(prefers-color-scheme:dark){${selector}{${cssStringFromTheme(
              theme.darkMode,
              { extends: theme.lightMode }
            )}}}` : null
          ].join("")
        }
      }
    ), children) : children))))))
  ))))));
}

// src/components/Dialog/Dialog.css.ts
var content = "_9pm4ki5 ju367va ju367v15 ju367v8r";
var overlay = "_9pm4ki3 ju367v9h ju367vb3 ju367va ju367v2q ju367v8q";

// src/components/Dialog/FocusTrap.tsx
import React22 from "react";
import { useCallback as useCallback5, useEffect as useEffect10, useRef as useRef2 } from "react";
var moveFocusWithin = (element2, position) => {
  const focusableElements = element2.querySelectorAll(
    "button:not(:disabled), a[href]"
  );
  if (focusableElements.length === 0) return;
  focusableElements[position === "end" ? focusableElements.length - 1 : 0].focus();
};
function FocusTrap(props) {
  const contentRef = useRef2(null);
  useEffect10(() => {
    const previouslyActiveElement = document.activeElement;
    return () => {
      previouslyActiveElement.focus?.();
    };
  }, []);
  useEffect10(() => {
    if (contentRef.current) {
      const elementToFocus = contentRef.current.querySelector("[data-auto-focus]");
      if (elementToFocus) {
        elementToFocus.focus();
      } else {
        contentRef.current.focus();
      }
    }
  }, []);
  return /* @__PURE__ */ React22.createElement(React22.Fragment, null, /* @__PURE__ */ React22.createElement(
    "div",
    {
      onFocus: useCallback5(
        () => contentRef.current && moveFocusWithin(contentRef.current, "end"),
        []
      ),
      tabIndex: 0
    }
  ), /* @__PURE__ */ React22.createElement(
    "div",
    {
      ref: contentRef,
      style: { outline: "none" },
      tabIndex: -1,
      ...props
    }
  ), /* @__PURE__ */ React22.createElement(
    "div",
    {
      onFocus: useCallback5(
        () => contentRef.current && moveFocusWithin(contentRef.current, "start"),
        []
      ),
      tabIndex: 0
    }
  ));
}

// src/components/Dialog/Dialog.tsx
var stopPropagation = (event) => event.stopPropagation();
function Dialog({ children, onClose, open, titleId }) {
  useEffect11(() => {
    const handleEscape = (event) => open && event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);
  const [bodyScrollable, setBodyScrollable] = useState9(true);
  useEffect11(() => {
    setBodyScrollable(
      getComputedStyle(window.document.body).overflow !== "hidden"
    );
  }, []);
  const handleBackdropClick = useCallback6(() => onClose(), [onClose]);
  const themeRootProps = useThemeRootProps();
  const mobile = isMobile();
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, open ? createPortal(
    /* @__PURE__ */ React23.createElement(RemoveScroll, { enabled: bodyScrollable }, /* @__PURE__ */ React23.createElement(Box, { ...themeRootProps }, /* @__PURE__ */ React23.createElement(
      Box,
      {
        ...themeRootProps,
        alignItems: mobile ? "flex-end" : "center",
        "aria-labelledby": titleId,
        "aria-modal": true,
        className: overlay,
        onClick: handleBackdropClick,
        position: "fixed",
        role: "dialog"
      },
      /* @__PURE__ */ React23.createElement(
        FocusTrap,
        {
          className: content,
          onClick: stopPropagation,
          role: "document"
        },
        children
      )
    ))),
    document.body
  ) : null);
}

// src/components/Dialog/DialogContent.tsx
import React24, { useContext as useContext8 } from "react";

// src/components/Dialog/DialogContent.css.ts
var bottomSheetOverrides = "_1ckjpok7";
var dialogContent = "_1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r";
var dialogContentCompactMode = "_1ckjpok4 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r";
var dialogContentMobile = "_1ckjpok6 ju367vq";
var dialogContentWideDesktop = "_1ckjpok3 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r";
var dialogContentWideMobile = "_1ckjpok2 _1ckjpok1 ju367vb6 ju367vdr ju367vp ju367vt ju367vv ju367vel ju367va ju367v15 ju367v6c ju367v8r";

// src/components/Dialog/DialogContent.tsx
function DialogContent({
  bottomSheetOnMobile = false,
  children,
  marginTop,
  padding = "16",
  paddingBottom,
  wide = false
}) {
  const mobile = isMobile();
  const modalSize = useContext8(ModalSizeContext);
  const compactModeEnabled = modalSize === ModalSizeOptions.COMPACT;
  return /* @__PURE__ */ React24.createElement(Box, { marginTop }, /* @__PURE__ */ React24.createElement(
    Box,
    {
      className: [
        wide ? mobile ? dialogContentWideMobile : compactModeEnabled ? dialogContentCompactMode : dialogContentWideDesktop : dialogContent,
        mobile ? dialogContentMobile : null,
        mobile && bottomSheetOnMobile ? bottomSheetOverrides : null
      ].join(" ")
    },
    /* @__PURE__ */ React24.createElement(Box, { padding, paddingBottom: paddingBottom ?? padding }, children)
  ));
}

// src/components/ProfileDetails/ProfileDetails.tsx
import React34, { useCallback as useCallback8, useContext as useContext10, useEffect as useEffect12, useState as useState10 } from "react";

// src/components/ConnectButton/abbreviateETHBalance.ts
var units = ["k", "m", "b", "t"];
function toPrecision(number, precision = 1) {
  return number.toString().replace(new RegExp(`(.+\\.\\d{${precision}})\\d+`), "$1").replace(/(\.[1-9]*)0+$/, "$1").replace(/\.$/, "");
}
function abbreviateETHBalance(number) {
  if (number < 1) return toPrecision(number, 3);
  if (number < 10 ** 2) return toPrecision(number, 2);
  if (number < 10 ** 4)
    return new Intl.NumberFormat().format(
      Number.parseFloat(toPrecision(number, 1))
    );
  const decimalsDivisor = 10 ** 1;
  let result = String(number);
  for (let i = units.length - 1; i >= 0; i--) {
    const size = 10 ** ((i + 1) * 3);
    if (size <= number) {
      number = number * decimalsDivisor / size / decimalsDivisor;
      result = toPrecision(number, 1) + units[i];
      break;
    }
  }
  return result;
}

// src/components/ConnectButton/formatAddress.ts
function formatAddress(address) {
  const leadingChars = 4;
  const trailingChars = 4;
  return address.length < leadingChars + trailingChars ? address : `${address.substring(0, leadingChars)}\u2026${address.substring(
    address.length - trailingChars
  )}`;
}

// src/components/ConnectButton/formatENS.ts
function formatENS(name) {
  if (!name) return "";
  const parts = name.split(".");
  const last = parts.pop();
  if (parts.join(".").length > 24) {
    return `${parts.join(".").substring(0, 24)}...`;
  }
  return `${parts.join(".")}.${last}`;
}

// src/components/Icons/Copied.tsx
import React25 from "react";
var CopiedIcon = () => /* @__PURE__ */ React25.createElement(
  "svg",
  {
    fill: "none",
    height: "13",
    viewBox: "0 0 13 13",
    width: "13",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React25.createElement("title", null, "Copied"),
  /* @__PURE__ */ React25.createElement(
    "path",
    {
      d: "M4.94568 12.2646C5.41052 12.2646 5.77283 12.0869 6.01892 11.7109L12.39 1.96973C12.5677 1.69629 12.6429 1.44336 12.6429 1.2041C12.6429 0.561523 12.1644 0.0966797 11.5082 0.0966797C11.057 0.0966797 10.7767 0.260742 10.5033 0.691406L4.9115 9.50977L2.07458 5.98926C1.82166 5.68848 1.54822 5.55176 1.16541 5.55176C0.502319 5.55176 0.0238037 6.02344 0.0238037 6.66602C0.0238037 6.95312 0.112671 7.20605 0.358765 7.48633L3.88611 11.7588C4.18005 12.1074 4.50818 12.2646 4.94568 12.2646Z",
      fill: "currentColor"
    }
  )
);

// src/components/Icons/Copy.tsx
import React26 from "react";
var CopyIcon = () => /* @__PURE__ */ React26.createElement(
  "svg",
  {
    fill: "none",
    height: "16",
    viewBox: "0 0 17 16",
    width: "17",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React26.createElement("title", null, "Copy"),
  /* @__PURE__ */ React26.createElement(
    "path",
    {
      d: "M3.04236 12.3027H4.18396V13.3008C4.18396 14.8525 5.03845 15.7002 6.59705 15.7002H13.6244C15.183 15.7002 16.0375 14.8525 16.0375 13.3008V6.24609C16.0375 4.69434 15.183 3.84668 13.6244 3.84668H12.4828V2.8418C12.4828 1.29688 11.6283 0.442383 10.0697 0.442383H3.04236C1.48376 0.442383 0.629272 1.29004 0.629272 2.8418V9.90332C0.629272 11.4551 1.48376 12.3027 3.04236 12.3027ZM3.23376 10.5391C2.68689 10.5391 2.39294 10.2656 2.39294 9.68457V3.06055C2.39294 2.47949 2.68689 2.21289 3.23376 2.21289H9.8783C10.4252 2.21289 10.7191 2.47949 10.7191 3.06055V3.84668H6.59705C5.03845 3.84668 4.18396 4.69434 4.18396 6.24609V10.5391H3.23376ZM6.78845 13.9365C6.24158 13.9365 5.94763 13.6699 5.94763 13.0889V6.45801C5.94763 5.87695 6.24158 5.61035 6.78845 5.61035H13.433C13.9799 5.61035 14.2738 5.87695 14.2738 6.45801V13.0889C14.2738 13.6699 13.9799 13.9365 13.433 13.9365H6.78845Z",
      fill: "currentColor"
    }
  )
);

// src/components/Icons/Disconnect.tsx
import React27 from "react";
var DisconnectIcon = () => /* @__PURE__ */ React27.createElement(
  "svg",
  {
    fill: "none",
    height: "16",
    viewBox: "0 0 18 16",
    width: "18",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React27.createElement("title", null, "Disconnect"),
  /* @__PURE__ */ React27.createElement(
    "path",
    {
      d: "M2.67834 15.5908H9.99963C11.5514 15.5908 12.399 14.7432 12.399 13.1777V10.2656H10.6354V12.9863C10.6354 13.5332 10.3688 13.8271 9.78772 13.8271H2.89026C2.3092 13.8271 2.0426 13.5332 2.0426 12.9863V3.15625C2.0426 2.60254 2.3092 2.30859 2.89026 2.30859H9.78772C10.3688 2.30859 10.6354 2.60254 10.6354 3.15625V5.89746H12.399V2.95801C12.399 1.39941 11.5514 0.544922 9.99963 0.544922H2.67834C1.12659 0.544922 0.278931 1.39941 0.278931 2.95801V13.1777C0.278931 14.7432 1.12659 15.5908 2.67834 15.5908ZM7.43616 8.85059H14.0875L15.0924 8.78906L14.566 9.14453L13.6842 9.96484C13.5406 10.1016 13.4586 10.2861 13.4586 10.4844C13.4586 10.8398 13.7321 11.168 14.1217 11.168C14.3199 11.168 14.4635 11.0928 14.6002 10.9561L16.7809 8.68652C16.986 8.48145 17.0543 8.27637 17.0543 8.06445C17.0543 7.85254 16.986 7.64746 16.7809 7.43555L14.6002 5.17285C14.4635 5.03613 14.3199 4.9541 14.1217 4.9541C13.7321 4.9541 13.4586 5.27539 13.4586 5.6377C13.4586 5.83594 13.5406 6.02734 13.6842 6.15723L14.566 6.98438L15.0924 7.33984L14.0875 7.27148H7.43616C7.01917 7.27148 6.65686 7.62012 6.65686 8.06445C6.65686 8.50195 7.01917 8.85059 7.43616 8.85059Z",
      fill: "currentColor"
    }
  )
);

// src/components/Txs/TxList.tsx
import React32, { useContext as useContext9 } from "react";
import { useAccount as useAccount9 } from "wagmi";

// src/transactions/useClearRecentTransactions.ts
import { useCallback as useCallback7 } from "react";
import { useAccount as useAccount7 } from "wagmi";
function useClearRecentTransactions() {
  const store = useTransactionStore();
  const { address } = useAccount7();
  const chainId = useChainId();
  return useCallback7(() => {
    if (!address || !chainId) {
      throw new Error("No address or chain ID found");
    }
    store.clearTransactions(address, chainId);
  }, [store, address, chainId]);
}

// src/utils/chainToExplorerUrl.ts
var chainToExplorerUrl = (chain) => chain?.blockExplorers?.default?.url;

// src/components/Icons/ExternalLink.tsx
import React28 from "react";
var ExternalLinkIcon = () => /* @__PURE__ */ React28.createElement(
  "svg",
  {
    fill: "none",
    height: "19",
    viewBox: "0 0 20 19",
    width: "20",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React28.createElement("title", null, "Link"),
  /* @__PURE__ */ React28.createElement(
    "path",
    {
      d: "M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM12.7158 12.1416C13.2432 12.1416 13.5684 11.7549 13.5684 11.1836V7.19336C13.5684 6.44629 13.1377 6.05957 12.417 6.05957H8.40918C7.8291 6.05957 7.45117 6.38477 7.45117 6.91211C7.45117 7.43945 7.8291 7.77344 8.40918 7.77344H9.69238L10.7207 7.63281L9.53418 8.67871L6.73047 11.4912C6.53711 11.6758 6.41406 11.9395 6.41406 12.2031C6.41406 12.7832 6.85352 13.1699 7.39844 13.1699C7.68848 13.1699 7.92578 13.0732 8.1543 12.8623L10.9316 10.0762L11.9775 8.89844L11.8545 9.98828V11.1836C11.8545 11.7725 12.1885 12.1416 12.7158 12.1416Z",
      fill: "currentColor"
    }
  )
);

// src/components/Txs/TxItem.tsx
import React31 from "react";
import { useAccount as useAccount8 } from "wagmi";

// src/components/Icons/Cancel.tsx
import React29 from "react";
var CancelIcon = () => /* @__PURE__ */ React29.createElement(
  "svg",
  {
    fill: "none",
    height: "19",
    viewBox: "0 0 20 19",
    width: "20",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React29.createElement("title", null, "Cancel"),
  /* @__PURE__ */ React29.createElement(
    "path",
    {
      d: "M10 18.9443C15.0977 18.9443 19.2812 14.752 19.2812 9.6543C19.2812 4.56543 15.0889 0.373047 10 0.373047C4.90234 0.373047 0.71875 4.56543 0.71875 9.6543C0.71875 14.752 4.91113 18.9443 10 18.9443ZM10 16.6328C6.1416 16.6328 3.03906 13.5215 3.03906 9.6543C3.03906 5.7959 6.13281 2.68457 10 2.68457C13.8584 2.68457 16.9697 5.7959 16.9697 9.6543C16.9785 13.5215 13.8672 16.6328 10 16.6328ZM7.29297 13.3018C7.58301 13.3018 7.81152 13.2139 7.99609 13.0205L10 11.0166L12.0127 13.0205C12.1973 13.2051 12.4258 13.3018 12.707 13.3018C13.2432 13.3018 13.6562 12.8887 13.6562 12.3525C13.6562 12.0977 13.5508 11.8691 13.3662 11.6934L11.3535 9.67188L13.375 7.6416C13.5596 7.44824 13.6562 7.22852 13.6562 6.98242C13.6562 6.44629 13.2432 6.0332 12.7158 6.0332C12.4346 6.0332 12.2148 6.12109 12.0215 6.31445L10 8.32715L7.9873 6.32324C7.80273 6.12988 7.58301 6.04199 7.29297 6.04199C6.76562 6.04199 6.35254 6.45508 6.35254 6.99121C6.35254 7.2373 6.44922 7.46582 6.63379 7.6416L8.65527 9.67188L6.63379 11.6934C6.44922 11.8691 6.35254 12.1064 6.35254 12.3525C6.35254 12.8887 6.76562 13.3018 7.29297 13.3018Z",
      fill: "currentColor"
    }
  )
);

// src/components/Icons/Success.tsx
import React30 from "react";
var SuccessIcon = () => /* @__PURE__ */ React30.createElement(
  "svg",
  {
    fill: "none",
    height: "20",
    viewBox: "0 0 20 20",
    width: "20",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React30.createElement("title", null, "Success"),
  /* @__PURE__ */ React30.createElement(
    "path",
    {
      d: "M10 19.4443C15.0977 19.4443 19.2812 15.252 19.2812 10.1543C19.2812 5.06543 15.0889 0.873047 10 0.873047C4.90234 0.873047 0.71875 5.06543 0.71875 10.1543C0.71875 15.252 4.91113 19.4443 10 19.4443ZM10 17.1328C6.1416 17.1328 3.03906 14.0215 3.03906 10.1543C3.03906 6.2959 6.13281 3.18457 10 3.18457C13.8584 3.18457 16.9697 6.2959 16.9697 10.1543C16.9785 14.0215 13.8672 17.1328 10 17.1328ZM9.07715 14.3379C9.4375 14.3379 9.7627 14.1533 9.97363 13.8369L13.7441 8.00977C13.8848 7.79883 13.9814 7.5791 13.9814 7.36816C13.9814 6.84961 13.5244 6.48926 13.0322 6.48926C12.707 6.48926 12.4258 6.66504 12.2148 7.0166L9.05957 12.0967L7.5918 10.2949C7.37207 10.0225 7.13477 9.9082 6.84473 9.9082C6.33496 9.9082 5.92188 10.3125 5.92188 10.8223C5.92188 11.0684 6.00098 11.2793 6.18555 11.5078L8.1543 13.8545C8.40918 14.1709 8.70801 14.3379 9.07715 14.3379Z",
      fill: "currentColor"
    }
  )
);

// src/components/Txs/TxItem.tsx
var getTxStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return SpinnerIcon;
    case "confirmed":
      return SuccessIcon;
    case "failed":
      return CancelIcon;
    default:
      return SpinnerIcon;
  }
};
function TxItem({ tx }) {
  const mobile = isMobile();
  const Icon = getTxStatusIcon(tx.status);
  const color = tx.status === "failed" ? "error" : "accentColor";
  const { chain: activeChain } = useAccount8();
  const confirmationStatus = tx.status === "confirmed" ? "Confirmed" : tx.status === "failed" ? "Failed" : "Pending";
  const explorerLink = chainToExplorerUrl(activeChain);
  return /* @__PURE__ */ React31.createElement(React31.Fragment, null, /* @__PURE__ */ React31.createElement(
    Box,
    {
      ...explorerLink ? {
        as: "a",
        background: { hover: "profileForeground" },
        borderRadius: "menuButton",
        className: touchableStyles({ active: "shrink" }),
        href: `${explorerLink}/tx/${tx.hash}`,
        rel: "noreferrer noopener",
        target: "_blank",
        transition: "default"
      } : {},
      color: "modalText",
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "8",
      width: "full"
    },
    /* @__PURE__ */ React31.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        gap: mobile ? "16" : "14"
      },
      /* @__PURE__ */ React31.createElement(Box, { color }, /* @__PURE__ */ React31.createElement(Icon, null)),
      /* @__PURE__ */ React31.createElement(Box, { display: "flex", flexDirection: "column", gap: mobile ? "3" : "1" }, /* @__PURE__ */ React31.createElement(Box, null, /* @__PURE__ */ React31.createElement(
        Text,
        {
          color: "modalText",
          font: "body",
          size: mobile ? "16" : "14",
          weight: "bold"
        },
        tx?.description
      )), /* @__PURE__ */ React31.createElement(Box, null, /* @__PURE__ */ React31.createElement(
        Text,
        {
          color: tx.status === "pending" ? "modalTextSecondary" : color,
          font: "body",
          size: "14",
          weight: mobile ? "medium" : "regular"
        },
        confirmationStatus
      )))
    ),
    explorerLink && /* @__PURE__ */ React31.createElement(Box, { alignItems: "center", color: "modalTextDim", display: "flex" }, /* @__PURE__ */ React31.createElement(ExternalLinkIcon, null))
  ));
}

// src/components/Txs/TxList.tsx
var NUMBER_OF_VISIBLE_TXS = 3;
function TxList({ address }) {
  const recentTransactions = useRecentTransactions();
  const clearRecentTransactions = useClearRecentTransactions();
  const { chain: activeChain } = useAccount9();
  const explorerLink = chainToExplorerUrl(activeChain);
  const visibleTxs = recentTransactions.slice(0, NUMBER_OF_VISIBLE_TXS);
  const hasTransactions = visibleTxs.length > 0;
  const mobile = isMobile();
  const { appName } = useContext9(AppContext);
  const { i18n: i18n2 } = useContext9(I18nContext);
  return /* @__PURE__ */ React32.createElement(React32.Fragment, null, /* @__PURE__ */ React32.createElement(
    Box,
    {
      display: "flex",
      flexDirection: "column",
      gap: "10",
      paddingBottom: "2",
      paddingTop: "16",
      paddingX: mobile ? "8" : "18"
    },
    hasTransactions && /* @__PURE__ */ React32.createElement(
      Box,
      {
        paddingBottom: mobile ? "4" : "0",
        paddingTop: "8",
        paddingX: mobile ? "12" : "6"
      },
      /* @__PURE__ */ React32.createElement(Box, { display: "flex", justifyContent: "space-between" }, /* @__PURE__ */ React32.createElement(
        Text,
        {
          color: "modalTextSecondary",
          size: mobile ? "16" : "14",
          weight: "semibold"
        },
        i18n2.t("profile.transactions.recent.title")
      ), /* @__PURE__ */ React32.createElement(
        Box,
        {
          style: {
            marginBottom: -6,
            marginLeft: -10,
            marginRight: -10,
            marginTop: -6
          }
        },
        /* @__PURE__ */ React32.createElement(
          Box,
          {
            as: "button",
            background: {
              hover: "profileForeground"
            },
            borderRadius: "actionButton",
            className: touchableStyles({ active: "shrink" }),
            onClick: clearRecentTransactions,
            paddingX: mobile ? "8" : "12",
            paddingY: mobile ? "4" : "5",
            transition: "default",
            type: "button"
          },
          /* @__PURE__ */ React32.createElement(
            Text,
            {
              color: "modalTextSecondary",
              size: mobile ? "16" : "14",
              weight: "semibold"
            },
            i18n2.t("profile.transactions.clear.label")
          )
        )
      ))
    ),
    /* @__PURE__ */ React32.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, hasTransactions ? visibleTxs.map((tx) => /* @__PURE__ */ React32.createElement(TxItem, { key: tx.hash, tx })) : /* @__PURE__ */ React32.createElement(React32.Fragment, null, /* @__PURE__ */ React32.createElement(Box, { padding: mobile ? "12" : "8" }, /* @__PURE__ */ React32.createElement(
      Text,
      {
        color: "modalTextDim",
        size: mobile ? "16" : "14",
        weight: mobile ? "medium" : "bold"
      },
      appName ? i18n2.t("profile.transactions.description", {
        appName
      }) : i18n2.t("profile.transactions.description_fallback")
    )), mobile && /* @__PURE__ */ React32.createElement(
      Box,
      {
        background: "generalBorderDim",
        height: "1",
        marginX: "12",
        marginY: "8"
      }
    )))
  ), explorerLink && /* @__PURE__ */ React32.createElement(Box, { paddingBottom: "18", paddingX: mobile ? "8" : "18" }, /* @__PURE__ */ React32.createElement(
    Box,
    {
      alignItems: "center",
      as: "a",
      background: { hover: "profileForeground" },
      borderRadius: "menuButton",
      className: touchableStyles({ active: "shrink" }),
      color: "modalTextDim",
      display: "flex",
      flexDirection: "row",
      href: `${explorerLink}/address/${address}`,
      justifyContent: "space-between",
      paddingX: "8",
      paddingY: "12",
      rel: "noreferrer noopener",
      style: { willChange: "transform" },
      target: "_blank",
      transition: "default",
      width: "full",
      ...mobile ? { paddingLeft: "12" } : {}
    },
    /* @__PURE__ */ React32.createElement(
      Text,
      {
        color: "modalText",
        font: "body",
        size: mobile ? "16" : "14",
        weight: mobile ? "semibold" : "bold"
      },
      i18n2.t("profile.explorer.label")
    ),
    /* @__PURE__ */ React32.createElement(ExternalLinkIcon, null)
  )));
}

// src/components/ProfileDetails/ProfileDetailsAction.tsx
import React33 from "react";
function ProfileDetailsAction({
  action,
  icon,
  label,
  testId,
  url
}) {
  const mobile = isMobile();
  return /* @__PURE__ */ React33.createElement(
    Box,
    {
      ...url ? { as: "a", href: url, rel: "noreferrer noopener", target: "_blank" } : { as: "button", type: "button" },
      background: {
        base: "profileAction",
        ...!mobile ? { hover: "profileActionHover" } : {}
      },
      borderRadius: "menuButton",
      boxShadow: "profileDetailsAction",
      className: touchableStyles({
        active: "shrinkSm",
        hover: !mobile ? "grow" : void 0
      }),
      display: "flex",
      onClick: action,
      padding: mobile ? "6" : "8",
      style: { willChange: "transform" },
      testId,
      transition: "default",
      width: "full"
    },
    /* @__PURE__ */ React33.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "1",
        justifyContent: "center",
        paddingTop: "2",
        width: "full"
      },
      /* @__PURE__ */ React33.createElement(Box, { color: "modalText", height: "max" }, icon),
      /* @__PURE__ */ React33.createElement(Box, null, /* @__PURE__ */ React33.createElement(Text, { color: "modalText", size: mobile ? "12" : "13", weight: "semibold" }, label))
    )
  );
}

// src/components/ProfileDetails/ProfileDetails.tsx
function ProfileDetails({
  address,
  ensAvatar,
  ensName,
  balance,
  onClose,
  onDisconnect
}) {
  const showRecentTransactions = useContext10(ShowRecentTransactionsContext);
  const [copiedAddress, setCopiedAddress] = useState10(false);
  const copyAddressAction = useCallback8(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
    }
  }, [address]);
  useEffect12(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [copiedAddress]);
  if (!address) {
    return null;
  }
  const accountName = ensName ? formatENS(ensName) : formatAddress(address);
  const ethBalance = balance?.formatted;
  const displayBalance = ethBalance ? abbreviateETHBalance(Number.parseFloat(ethBalance)) : void 0;
  const titleId = "rk_profile_title";
  const mobile = isMobile();
  const { i18n: i18n2 } = useContext10(I18nContext);
  return /* @__PURE__ */ React34.createElement(React34.Fragment, null, /* @__PURE__ */ React34.createElement(Box, { display: "flex", flexDirection: "column" }, /* @__PURE__ */ React34.createElement(Box, { background: "profileForeground", padding: "16" }, /* @__PURE__ */ React34.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: mobile ? "16" : "12",
      justifyContent: "center",
      margin: "8",
      style: { textAlign: "center" }
    },
    /* @__PURE__ */ React34.createElement(
      Box,
      {
        style: {
          position: "absolute",
          right: 16,
          top: 16,
          willChange: "transform"
        }
      },
      /* @__PURE__ */ React34.createElement(CloseButton, { onClose })
    ),
    " ",
    /* @__PURE__ */ React34.createElement(Box, { marginTop: mobile ? "24" : "0" }, /* @__PURE__ */ React34.createElement(
      Avatar,
      {
        address,
        imageUrl: ensAvatar,
        size: mobile ? 82 : 74
      }
    )),
    /* @__PURE__ */ React34.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        gap: mobile ? "4" : "0",
        textAlign: "center"
      },
      /* @__PURE__ */ React34.createElement(Box, { textAlign: "center" }, /* @__PURE__ */ React34.createElement(
        Text,
        {
          as: "h1",
          color: "modalText",
          id: titleId,
          size: mobile ? "20" : "18",
          weight: "heavy"
        },
        accountName
      )),
      !!balance && /* @__PURE__ */ React34.createElement(Box, { textAlign: "center" }, /* @__PURE__ */ React34.createElement(
        Text,
        {
          as: "h1",
          color: "modalTextSecondary",
          id: titleId,
          size: mobile ? "16" : "14",
          weight: "semibold"
        },
        displayBalance,
        " ",
        balance.symbol
      ))
    )
  ), /* @__PURE__ */ React34.createElement(
    Box,
    {
      display: "flex",
      flexDirection: "row",
      gap: "8",
      margin: "2",
      marginTop: "16"
    },
    /* @__PURE__ */ React34.createElement(
      ProfileDetailsAction,
      {
        action: copyAddressAction,
        icon: copiedAddress ? /* @__PURE__ */ React34.createElement(CopiedIcon, null) : /* @__PURE__ */ React34.createElement(CopyIcon, null),
        label: copiedAddress ? i18n2.t("profile.copy_address.copied") : i18n2.t("profile.copy_address.label")
      }
    ),
    /* @__PURE__ */ React34.createElement(
      ProfileDetailsAction,
      {
        action: onDisconnect,
        icon: /* @__PURE__ */ React34.createElement(DisconnectIcon, null),
        label: i18n2.t("profile.disconnect.label"),
        testId: "disconnect-button"
      }
    )
  )), showRecentTransactions && /* @__PURE__ */ React34.createElement(React34.Fragment, null, /* @__PURE__ */ React34.createElement(Box, { background: "generalBorder", height: "1", marginTop: "-1" }), /* @__PURE__ */ React34.createElement(Box, null, /* @__PURE__ */ React34.createElement(TxList, { address })))));
}

// src/components/AccountModal/AccountModal.tsx
function AccountModal({ onClose, open }) {
  const { address } = useAccount10();
  const { balance, ensAvatar, ensName } = useProfile({
    address,
    includeBalance: open
  });
  const { disconnect } = useDisconnect();
  if (!address) {
    return null;
  }
  const titleId = "rk_account_modal_title";
  return /* @__PURE__ */ React35.createElement(React35.Fragment, null, address && /* @__PURE__ */ React35.createElement(Dialog, { onClose, open, titleId }, /* @__PURE__ */ React35.createElement(DialogContent, { bottomSheetOnMobile: true, padding: "0" }, /* @__PURE__ */ React35.createElement(
    ProfileDetails,
    {
      address,
      ensAvatar,
      ensName,
      balance,
      onClose,
      onDisconnect: disconnect
    }
  ))));
}

// src/components/ChainModal/ChainModal.tsx
import React39, { useContext as useContext12, useState as useState11 } from "react";
import { useAccount as useAccount11, useDisconnect as useDisconnect2, useSwitchChain } from "wagmi";
import { useConfig as useConfig2 } from "wagmi";

// src/components/Icons/DisconnectSq.tsx
import React36 from "react";
var DisconnectSqIcon = ({ size }) => /* @__PURE__ */ React36.createElement(
  "svg",
  {
    fill: "none",
    height: size,
    viewBox: "0 0 28 28",
    width: size,
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React36.createElement("title", null, "Disconnect"),
  /* @__PURE__ */ React36.createElement(
    "path",
    {
      d: "M6.742 22.195h8.367c1.774 0 2.743-.968 2.743-2.758V16.11h-2.016v3.11c0 .625-.305.96-.969.96H6.984c-.664 0-.968-.335-.968-.96V7.984c0-.632.304-.968.968-.968h7.883c.664 0 .969.336.969.968v3.133h2.016v-3.36c0-1.78-.97-2.757-2.743-2.757H6.742C4.97 5 4 5.977 4 7.758v11.68c0 1.789.969 2.757 2.742 2.757Zm5.438-7.703h7.601l1.149-.07-.602.406-1.008.938a.816.816 0 0 0-.258.593c0 .407.313.782.758.782.227 0 .39-.086.547-.243l2.492-2.593c.235-.235.313-.47.313-.711 0-.242-.078-.477-.313-.719l-2.492-2.586c-.156-.156-.32-.25-.547-.25-.445 0-.758.367-.758.781 0 .227.094.446.258.594l1.008.945.602.407-1.149-.079H12.18a.904.904 0 0 0 0 1.805Z",
      fill: "currentColor"
    }
  )
);

// src/components/MenuButton/MenuButton.tsx
import React37 from "react";

// src/components/MenuButton/MenuButton.css.ts
var unsetBackgroundOnHover = "v9horb0";

// src/components/MenuButton/MenuButton.tsx
var MenuButton = React37.forwardRef(
  ({
    children,
    currentlySelected = false,
    onClick,
    testId,
    ...urlProps
  }, ref) => {
    const mobile = isMobile();
    return /* @__PURE__ */ React37.createElement(
      Box,
      {
        as: "button",
        borderRadius: "menuButton",
        disabled: currentlySelected,
        display: "flex",
        onClick,
        ref,
        testId,
        type: "button"
      },
      /* @__PURE__ */ React37.createElement(
        Box,
        {
          borderRadius: "menuButton",
          className: [
            mobile ? unsetBackgroundOnHover : void 0,
            !currentlySelected && touchableStyles({ active: "shrink" })
          ],
          padding: mobile ? "8" : "6",
          transition: "default",
          width: "full",
          ...currentlySelected ? {
            background: "accentColor",
            borderColor: "selectedOptionBorder",
            borderStyle: "solid",
            borderWidth: "1",
            boxShadow: "selectedOption",
            color: "accentColorForeground"
          } : {
            background: { hover: "menuItemBackground" },
            color: "modalText",
            transition: "default"
          },
          ...urlProps
        },
        children
      )
    );
  }
);
MenuButton.displayName = "MenuButton";

// src/components/ChainModal/Chain.tsx
import React38, { Fragment, useContext as useContext11 } from "react";
var Chain = ({
  chainId,
  currentChainId,
  switchChain,
  chainIconSize,
  isLoading,
  src: src7,
  name,
  iconBackground,
  idx
}) => {
  const mobile = isMobile();
  const { i18n: i18n2 } = useContext11(I18nContext);
  const rainbowkitChains = useRainbowKitChains();
  const isCurrentChain = currentChainId === chainId;
  return /* @__PURE__ */ React38.createElement(Fragment, null, /* @__PURE__ */ React38.createElement(
    MenuButton,
    {
      currentlySelected: isCurrentChain,
      onClick: isCurrentChain ? void 0 : () => switchChain({ chainId }),
      testId: `chain-option-${chainId}`
    },
    /* @__PURE__ */ React38.createElement(Box, { fontFamily: "body", fontSize: "16", fontWeight: "bold" }, /* @__PURE__ */ React38.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      },
      /* @__PURE__ */ React38.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          gap: "4",
          height: chainIconSize
        },
        src7 && /* @__PURE__ */ React38.createElement(Box, { height: "full", marginRight: "8" }, /* @__PURE__ */ React38.createElement(
          AsyncImage,
          {
            alt: name,
            background: iconBackground,
            borderRadius: "full",
            height: chainIconSize,
            src: src7,
            width: chainIconSize,
            testId: `chain-option-${chainId}-icon`
          }
        )),
        /* @__PURE__ */ React38.createElement("div", null, name ?? name)
      ),
      isCurrentChain && /* @__PURE__ */ React38.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          marginRight: "6"
        },
        /* @__PURE__ */ React38.createElement(Text, { color: "accentColorForeground", size: "14", weight: "medium" }, i18n2.t("chains.connected")),
        /* @__PURE__ */ React38.createElement(
          Box,
          {
            background: "connectionIndicator",
            borderColor: "selectedOptionBorder",
            borderRadius: "full",
            borderStyle: "solid",
            borderWidth: "1",
            height: "8",
            marginLeft: "8",
            width: "8"
          }
        )
      ),
      isLoading && /* @__PURE__ */ React38.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          marginRight: "6"
        },
        /* @__PURE__ */ React38.createElement(Text, { color: "modalText", size: "14", weight: "medium" }, i18n2.t("chains.confirm")),
        /* @__PURE__ */ React38.createElement(
          Box,
          {
            background: "standby",
            borderRadius: "full",
            height: "8",
            marginLeft: "8",
            width: "8"
          }
        )
      )
    ))
  ), mobile && idx < rainbowkitChains.length - 1 && /* @__PURE__ */ React38.createElement(Box, { background: "generalBorderDim", height: "1", marginX: "8" }));
};
var Chain_default = Chain;

// src/components/ChainModal/ChainModal.css.ts
var DesktopScrollClassName = "_18dqw9x0";
var MobileScrollClassName = "_18dqw9x1";

// src/components/ChainModal/ChainModal.tsx
function ChainModal({ onClose, open }) {
  const { chainId } = useAccount11();
  const { chains } = useConfig2();
  const [pendingChainId, setPendingChainId] = useState11(null);
  const { switchChain } = useSwitchChain({
    mutation: {
      onMutate: ({ chainId: _chainId }) => {
        setPendingChainId(_chainId);
      },
      onSuccess: () => {
        if (pendingChainId) setPendingChainId(null);
      },
      onError: () => {
        if (pendingChainId) setPendingChainId(null);
      },
      onSettled: () => {
        onClose();
      }
    }
  });
  const { i18n: i18n2 } = useContext12(I18nContext);
  const { disconnect } = useDisconnect2();
  const titleId = "rk_chain_modal_title";
  const mobile = isMobile();
  const isCurrentChainSupported = chains.some((chain) => chain.id === chainId);
  const chainIconSize = mobile ? "36" : "28";
  const rainbowkitChains = useRainbowKitChains();
  if (!chainId) {
    return null;
  }
  return /* @__PURE__ */ React39.createElement(Dialog, { onClose, open, titleId }, /* @__PURE__ */ React39.createElement(DialogContent, { bottomSheetOnMobile: true, paddingBottom: "0" }, /* @__PURE__ */ React39.createElement(Box, { display: "flex", flexDirection: "column", gap: "14" }, /* @__PURE__ */ React39.createElement(
    Box,
    {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    mobile && /* @__PURE__ */ React39.createElement(Box, { width: "30" }),
    /* @__PURE__ */ React39.createElement(Box, { paddingBottom: "0", paddingLeft: "8", paddingTop: "4" }, /* @__PURE__ */ React39.createElement(
      Text,
      {
        as: "h1",
        color: "modalText",
        id: titleId,
        size: mobile ? "20" : "18",
        weight: "heavy"
      },
      i18n2.t("chains.title")
    )),
    /* @__PURE__ */ React39.createElement(CloseButton, { onClose })
  ), !isCurrentChainSupported && /* @__PURE__ */ React39.createElement(Box, { marginX: "8", textAlign: mobile ? "center" : "left" }, /* @__PURE__ */ React39.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t("chains.wrong_network"))), /* @__PURE__ */ React39.createElement(
    Box,
    {
      className: mobile ? MobileScrollClassName : DesktopScrollClassName,
      display: "flex",
      flexDirection: "column",
      gap: "4",
      padding: "2",
      paddingBottom: "16"
    },
    rainbowkitChains.map(
      ({ iconBackground, iconUrl, id, name }, idx) => {
        return /* @__PURE__ */ React39.createElement(
          Chain_default,
          {
            key: id,
            chainId: id,
            currentChainId: chainId,
            switchChain,
            chainIconSize,
            isLoading: pendingChainId === id,
            src: iconUrl,
            name,
            iconBackground,
            idx
          }
        );
      }
    ),
    !isCurrentChainSupported && /* @__PURE__ */ React39.createElement(React39.Fragment, null, /* @__PURE__ */ React39.createElement(Box, { background: "generalBorderDim", height: "1", marginX: "8" }), /* @__PURE__ */ React39.createElement(
      MenuButton,
      {
        onClick: () => disconnect(),
        testId: "chain-option-disconnect"
      },
      /* @__PURE__ */ React39.createElement(
        Box,
        {
          color: "error",
          fontFamily: "body",
          fontSize: "16",
          fontWeight: "bold"
        },
        /* @__PURE__ */ React39.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          },
          /* @__PURE__ */ React39.createElement(
            Box,
            {
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              gap: "4",
              height: chainIconSize
            },
            /* @__PURE__ */ React39.createElement(
              Box,
              {
                alignItems: "center",
                color: "error",
                height: chainIconSize,
                justifyContent: "center",
                marginRight: "8"
              },
              /* @__PURE__ */ React39.createElement(DisconnectSqIcon, { size: Number(chainIconSize) })
            ),
            /* @__PURE__ */ React39.createElement("div", null, i18n2.t("chains.disconnect"))
          )
        )
      )
    ))
  ))));
}

// src/components/ConnectModal/ConnectModal.tsx
import React57 from "react";
import { useAccount as useAccount12, useDisconnect as useDisconnect3 } from "wagmi";

// src/components/ConnectOptions/ConnectOptions.tsx
import React56, { useContext as useContext19 } from "react";

// src/components/ConnectOptions/DesktopOptions.tsx
import React53, {
  Fragment as Fragment2,
  useContext as useContext16,
  useEffect as useEffect15,
  useRef as useRef4,
  useState as useState12
} from "react";

// src/utils/groupBy.ts
function groupBy(items, getKey) {
  const groupedItems = {};
  for (const item of items) {
    const key = getKey(item);
    if (!key) {
      continue;
    }
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  }
  return groupedItems;
}

// src/components/ConnectModal/ConnectModalIntro.tsx
import React42, { useContext as useContext13 } from "react";

// src/components/Disclaimer/DisclaimerLink.tsx
import React40 from "react";
var DisclaimerLink = ({
  children,
  href
}) => {
  return /* @__PURE__ */ React40.createElement(
    Box,
    {
      as: "a",
      color: "accentColor",
      href,
      rel: "noreferrer",
      target: "_blank"
    },
    children
  );
};

// src/components/Disclaimer/DisclaimerText.tsx
import React41 from "react";
var DisclaimerText = ({ children }) => {
  return /* @__PURE__ */ React41.createElement(Text, { color: "modalTextSecondary", size: "12", weight: "medium" }, children);
};

// src/components/ConnectModal/ConnectModalIntro.tsx
function ConnectModalIntro({
  compactModeEnabled = false,
  getWallet
}) {
  const { disclaimer: Disclaimer, learnMoreUrl } = useContext13(AppContext);
  const { i18n: i18n2 } = useContext13(I18nContext);
  return /* @__PURE__ */ React42.createElement(React42.Fragment, null, /* @__PURE__ */ React42.createElement(
    Box,
    {
      alignItems: "center",
      color: "accentColor",
      display: "flex",
      flexDirection: "column",
      height: "full",
      justifyContent: "space-around"
    },
    /* @__PURE__ */ React42.createElement(Box, { marginBottom: "10" }, !compactModeEnabled && /* @__PURE__ */ React42.createElement(Text, { color: "modalText", size: "18", weight: "heavy" }, i18n2.t("intro.title"))),
    /* @__PURE__ */ React42.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        gap: "32",
        justifyContent: "center",
        marginY: "20",
        style: { maxWidth: 312 }
      },
      /* @__PURE__ */ React42.createElement(Box, { alignItems: "center", display: "flex", flexDirection: "row", gap: "16" }, /* @__PURE__ */ React42.createElement(Box, { borderRadius: "6", height: "48", minWidth: "48", width: "48" }, /* @__PURE__ */ React42.createElement(AssetsIcon, null)), /* @__PURE__ */ React42.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React42.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t("intro.digital_asset.title")), /* @__PURE__ */ React42.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t("intro.digital_asset.description")))),
      /* @__PURE__ */ React42.createElement(Box, { alignItems: "center", display: "flex", flexDirection: "row", gap: "16" }, /* @__PURE__ */ React42.createElement(Box, { borderRadius: "6", height: "48", minWidth: "48", width: "48" }, /* @__PURE__ */ React42.createElement(LoginIcon, null)), /* @__PURE__ */ React42.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React42.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t("intro.login.title")), /* @__PURE__ */ React42.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t("intro.login.description"))))
    ),
    /* @__PURE__ */ React42.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12",
        justifyContent: "center",
        margin: "10"
      },
      /* @__PURE__ */ React42.createElement(ActionButton, { label: i18n2.t("intro.get.label"), onClick: getWallet }),
      /* @__PURE__ */ React42.createElement(
        Box,
        {
          as: "a",
          className: touchableStyles({ active: "shrink", hover: "grow" }),
          display: "block",
          href: learnMoreUrl,
          paddingX: "12",
          paddingY: "4",
          rel: "noreferrer",
          style: { willChange: "transform" },
          target: "_blank",
          transition: "default"
        },
        /* @__PURE__ */ React42.createElement(Text, { color: "accentColor", size: "14", weight: "bold" }, i18n2.t("intro.learn_more.label"))
      )
    ),
    Disclaimer && !compactModeEnabled && /* @__PURE__ */ React42.createElement(Box, { marginBottom: "8", marginTop: "12", textAlign: "center" }, /* @__PURE__ */ React42.createElement(Disclaimer, { Link: DisclaimerLink, Text: DisclaimerText }))
  ));
}

// src/components/Icons/Back.tsx
import React43 from "react";
var BackIcon = () => /* @__PURE__ */ React43.createElement(
  "svg",
  {
    fill: "none",
    height: "17",
    viewBox: "0 0 11 17",
    width: "11",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React43.createElement("title", null, "Back"),
  /* @__PURE__ */ React43.createElement(
    "path",
    {
      d: "M0.99707 8.6543C0.99707 9.08496 1.15527 9.44531 1.51562 9.79688L8.16016 16.3096C8.43262 16.5732 8.74902 16.7051 9.13574 16.7051C9.90918 16.7051 10.5508 16.0811 10.5508 15.3076C10.5508 14.9121 10.3838 14.5605 10.0938 14.2705L4.30176 8.64551L10.0938 3.0293C10.3838 2.74805 10.5508 2.3877 10.5508 2.00098C10.5508 1.23633 9.90918 0.603516 9.13574 0.603516C8.74902 0.603516 8.43262 0.735352 8.16016 0.999023L1.51562 7.51172C1.15527 7.85449 1.00586 8.21484 0.99707 8.6543Z",
      fill: "currentColor"
    }
  )
);

// src/components/InfoButton/InfoButton.tsx
import React45 from "react";

// src/components/Icons/Info.tsx
import React44 from "react";
var InfoIcon = () => /* @__PURE__ */ React44.createElement(
  "svg",
  {
    fill: "none",
    height: "12",
    viewBox: "0 0 8 12",
    width: "8",
    xmlns: "http://www.w3.org/2000/svg"
  },
  /* @__PURE__ */ React44.createElement("title", null, "Info"),
  /* @__PURE__ */ React44.createElement(
    "path",
    {
      d: "M3.64258 7.99609C4.19336 7.99609 4.5625 7.73828 4.68555 7.24609C4.69141 7.21094 4.70312 7.16406 4.70898 7.13477C4.80859 6.60742 5.05469 6.35547 6.04492 5.76367C7.14648 5.10156 7.67969 4.3457 7.67969 3.24414C7.67969 1.39844 6.17383 0.255859 3.95898 0.255859C2.32422 0.255859 1.05859 0.894531 0.548828 1.86719C0.396484 2.14844 0.320312 2.44727 0.320312 2.74023C0.314453 3.37305 0.742188 3.79492 1.42188 3.79492C1.91406 3.79492 2.33594 3.54883 2.53516 3.11523C2.78711 2.47656 3.23242 2.21289 3.83594 2.21289C4.55664 2.21289 5.10742 2.65234 5.10742 3.29102C5.10742 3.9707 4.7793 4.29883 3.81836 4.87891C3.02148 5.36523 2.50586 5.92773 2.50586 6.76562V6.90039C2.50586 7.55664 2.96289 7.99609 3.64258 7.99609ZM3.67188 11.4473C4.42773 11.4473 5.04297 10.8672 5.04297 10.1406C5.04297 9.41406 4.42773 8.83984 3.67188 8.83984C2.91602 8.83984 2.30664 9.41406 2.30664 10.1406C2.30664 10.8672 2.91602 11.4473 3.67188 11.4473Z",
      fill: "currentColor"
    }
  )
);

// src/components/InfoButton/InfoButton.tsx
var InfoButton = ({
  "aria-label": ariaLabel = "Info",
  onClick
}) => {
  const mobile = isMobile();
  return /* @__PURE__ */ React45.createElement(
    Box,
    {
      alignItems: "center",
      "aria-label": ariaLabel,
      as: "button",
      background: "closeButtonBackground",
      borderColor: "actionButtonBorder",
      borderRadius: "full",
      borderStyle: "solid",
      borderWidth: mobile ? "0" : "1",
      className: touchableStyles({ active: "shrinkSm", hover: "growLg" }),
      color: "closeButton",
      display: "flex",
      height: mobile ? "30" : "28",
      justifyContent: "center",
      onClick,
      style: { willChange: "transform" },
      transition: "default",
      type: "button",
      width: mobile ? "30" : "28"
    },
    /* @__PURE__ */ React45.createElement(InfoIcon, null)
  );
};

// src/components/ModalSelection/ModalSelection.tsx
import React46 from "react";

// src/components/RainbowKitProvider/useCoolMode.ts
import { useContext as useContext14, useEffect as useEffect13, useRef as useRef3 } from "react";
var useCoolMode = (imageUrl) => {
  const ref = useRef3(null);
  const coolModeEnabled = useContext14(CoolModeContext);
  const resolvedImageUrl = useAsyncImage(imageUrl);
  useEffect13(() => {
    if (coolModeEnabled && ref.current && resolvedImageUrl) {
      return makeElementCool(ref.current, resolvedImageUrl);
    }
  }, [coolModeEnabled, resolvedImageUrl]);
  return ref;
};
var getContainer = () => {
  const id = "_rk_coolMode";
  const existingContainer = document.getElementById(id);
  if (existingContainer) {
    return existingContainer;
  }
  const container = document.createElement("div");
  container.setAttribute("id", id);
  container.setAttribute(
    "style",
    [
      "overflow:hidden",
      "position:fixed",
      "height:100%",
      "top:0",
      "left:0",
      "right:0",
      "bottom:0",
      "pointer-events:none",
      "z-index:2147483647"
    ].join(";")
  );
  document.body.appendChild(container);
  return container;
};
var instanceCounter = 0;
function makeElementCool(element2, imageUrl) {
  instanceCounter++;
  const sizes = [15, 20, 25, 35, 45];
  const limit = 35;
  let particles = [];
  let autoAddParticle = false;
  let mouseX = 0;
  let mouseY = 0;
  const container = getContainer();
  function createParticle() {
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const speedHorz = Math.random() * 10;
    const speedUp = Math.random() * 25;
    const spinVal = Math.random() * 360;
    const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1);
    const top = mouseY - size / 2;
    const left = mouseX - size / 2;
    const direction = Math.random() <= 0.5 ? -1 : 1;
    const particle = document.createElement("div");
    particle.innerHTML = `<img src="${imageUrl}" width="${size}" height="${size}" style="border-radius: 25%">`;
    particle.setAttribute(
      "style",
      [
        "position:absolute",
        "will-change:transform",
        `top:${top}px`,
        `left:${left}px`,
        `transform:rotate(${spinVal}deg)`
      ].join(";")
    );
    container.appendChild(particle);
    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top
    });
  }
  function updateParticles() {
    for (const p of particles) {
      p.left = p.left - p.speedHorz * p.direction;
      p.top = p.top - p.speedUp;
      p.speedUp = Math.min(p.size, p.speedUp - 1);
      p.spinVal = p.spinVal + p.spinSpeed;
      if (p.top >= Math.max(window.innerHeight, document.body.clientHeight) + p.size) {
        particles = particles.filter((o) => o !== p);
        p.element.remove();
      }
      p.element.setAttribute(
        "style",
        [
          "position:absolute",
          "will-change:transform",
          `top:${p.top}px`,
          `left:${p.left}px`,
          `transform:rotate(${p.spinVal}deg)`
        ].join(";")
      );
    }
  }
  let animationFrame;
  function loop() {
    if (autoAddParticle && particles.length < limit) {
      createParticle();
    }
    updateParticles();
    animationFrame = requestAnimationFrame(loop);
  }
  loop();
  const isTouchInteraction = "ontouchstart" in window || // @ts-expect-error
  navigator.msMaxTouchPoints;
  const tap = isTouchInteraction ? "touchstart" : "mousedown";
  const tapEnd = isTouchInteraction ? "touchend" : "mouseup";
  const move = isTouchInteraction ? "touchmove" : "mousemove";
  const updateMousePosition = (e) => {
    if ("touches" in e) {
      mouseX = e.touches?.[0].clientX;
      mouseY = e.touches?.[0].clientY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  };
  const tapHandler = (e) => {
    updateMousePosition(e);
    autoAddParticle = true;
  };
  const disableAutoAddParticle = () => {
    autoAddParticle = false;
  };
  element2.addEventListener(move, updateMousePosition, { passive: false });
  element2.addEventListener(tap, tapHandler);
  element2.addEventListener(tapEnd, disableAutoAddParticle);
  element2.addEventListener("mouseleave", disableAutoAddParticle);
  return () => {
    element2.removeEventListener(move, updateMousePosition);
    element2.removeEventListener(tap, tapHandler);
    element2.removeEventListener(tapEnd, disableAutoAddParticle);
    element2.removeEventListener("mouseleave", disableAutoAddParticle);
    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame);
        clearInterval(interval);
        if (--instanceCounter === 0) {
          container.remove();
        }
      }
    }, 500);
  };
}

// src/components/ModalSelection/ModalSelection.css.ts
var transparentBorder = "g5kl0l0";

// src/components/ModalSelection/ModalSelection.tsx
var ModalSelection = ({
  as = "button",
  currentlySelected = false,
  iconBackground,
  iconUrl,
  name,
  onClick,
  ready,
  recent,
  testId,
  isRainbowKitConnector: isRainbowKitConnector2,
  ...urlProps
}) => {
  const coolModeRef = useCoolMode(iconUrl);
  const [isMouseOver, setIsMouseOver] = React46.useState(false);
  const { i18n: i18n2 } = React46.useContext(I18nContext);
  return /* @__PURE__ */ React46.createElement(
    Box,
    {
      display: "flex",
      flexDirection: "column",
      onMouseEnter: () => setIsMouseOver(true),
      onMouseLeave: () => setIsMouseOver(false),
      ref: coolModeRef
    },
    /* @__PURE__ */ React46.createElement(
      Box,
      {
        as,
        borderRadius: "menuButton",
        borderStyle: "solid",
        borderWidth: "1",
        className: !currentlySelected ? [
          transparentBorder,
          touchableStyles({
            active: "shrink"
          })
        ] : void 0,
        disabled: currentlySelected,
        onClick,
        padding: "5",
        style: { willChange: "transform" },
        testId,
        transition: "default",
        width: "full",
        ...currentlySelected ? {
          background: "accentColor",
          borderColor: "selectedOptionBorder",
          boxShadow: "selectedWallet"
        } : {
          background: { hover: "menuItemBackground" }
        },
        ...urlProps
      },
      /* @__PURE__ */ React46.createElement(
        Box,
        {
          color: currentlySelected ? "accentColorForeground" : "modalText",
          disabled: !ready,
          fontFamily: "body",
          fontSize: "16",
          fontWeight: "bold",
          transition: "default"
        },
        /* @__PURE__ */ React46.createElement(Box, { alignItems: "center", display: "flex", flexDirection: "row", gap: "12" }, /* @__PURE__ */ React46.createElement(
          AsyncImage,
          {
            background: iconBackground,
            ...!isMouseOver && isRainbowKitConnector2 ? { borderColor: "actionButtonBorder" } : {},
            useAsImage: !isRainbowKitConnector2,
            borderRadius: "6",
            height: "28",
            src: iconUrl,
            width: "28"
          }
        ), /* @__PURE__ */ React46.createElement(Box, null, /* @__PURE__ */ React46.createElement(
          Box,
          {
            style: { marginTop: recent ? -2 : void 0 },
            maxWidth: "200"
          },
          name
        ), recent && /* @__PURE__ */ React46.createElement(
          Text,
          {
            color: currentlySelected ? "accentColorForeground" : "accentColor",
            size: "12",
            style: { lineHeight: 1, marginTop: -1 },
            weight: "medium"
          },
          i18n2.t("connect.recent")
        )))
      )
    )
  );
};
ModalSelection.displayName = "ModalSelection";

// src/wallets/latestWalletId.ts
var storageKey5 = "rk-latest-id";
function getLatestWalletId() {
  return typeof localStorage !== "undefined" ? localStorage.getItem(storageKey5) || "" : "";
}
function addLatestWalletId(walletId) {
  localStorage.setItem(storageKey5, walletId);
}
function clearLatestWalletId() {
  localStorage.removeItem(storageKey5);
}

// src/components/ConnectOptions/ConnectDetails.tsx
import React52, { useContext as useContext15, useEffect as useEffect14 } from "react";

// src/utils/colors.ts
var convertHexToRGBA = (hexCode, opacity = 1) => {
  let hex = hexCode.replace("#", "");
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  const r = Number.parseInt(hex.substring(0, 2), 16);
  const g = Number.parseInt(hex.substring(2, 4), 16);
  const b = Number.parseInt(hex.substring(4, 6), 16);
  if (opacity > 1 && opacity <= 100) {
    opacity = opacity / 100;
  }
  return `rgba(${r},${g},${b},${opacity})`;
};
var getGradientRGBAs = (hexColor) => {
  if (!hexColor) return null;
  return [
    convertHexToRGBA(hexColor, 0.2),
    convertHexToRGBA(hexColor, 0.14),
    convertHexToRGBA(hexColor, 0.1)
  ];
};
var isHexString = (color) => {
  return /^#([0-9a-f]{3}){1,2}$/i.test(color);
};

// src/components/Icons/Connect.tsx
import React47 from "react";
var src3 = async () => (await import("./connect-UA7M4XW6.js")).default;
var preloadConnectIcon = () => loadImages(src3);
var ConnectIcon = () => /* @__PURE__ */ React47.createElement(
  AsyncImage,
  {
    background: "#515a70",
    borderColor: "generalBorder",
    borderRadius: "10",
    height: "48",
    src: src3,
    width: "48"
  }
);

// src/components/Icons/Create.tsx
import React48 from "react";
var src4 = async () => (await import("./create-FASO7PVG.js")).default;
var preloadCreateIcon = () => loadImages(src4);
var CreateIcon = () => /* @__PURE__ */ React48.createElement(
  AsyncImage,
  {
    background: "#e3a5e8",
    borderColor: "generalBorder",
    borderRadius: "10",
    height: "48",
    src: src4,
    width: "48"
  }
);

// src/components/Icons/Refresh.tsx
import React49 from "react";
var src5 = async () => (await import("./refresh-S4T5V5GX.js")).default;
var preloadRefreshIcon = () => loadImages(src5);
var RefreshIcon = () => /* @__PURE__ */ React49.createElement(
  AsyncImage,
  {
    background: "#515a70",
    borderColor: "generalBorder",
    borderRadius: "10",
    height: "48",
    src: src5,
    width: "48"
  }
);

// src/components/Icons/Scan.tsx
import React50 from "react";
var src6 = async () => (await import("./scan-4UYSQ56Q.js")).default;
var preloadScanIcon = () => loadImages(src6);
var ScanIcon = () => /* @__PURE__ */ React50.createElement(
  AsyncImage,
  {
    background: "#515a70",
    borderColor: "generalBorder",
    borderRadius: "10",
    height: "48",
    src: src6,
    width: "48"
  }
);

// src/components/QRCode/QRCode.tsx
import React51 from "react";
import { Cuer } from "cuer";

// src/components/ConnectOptions/DesktopOptions.css.ts
var QRCodeBackgroundClassName = "_1vwt0cg0";
var ScrollClassName = "_1vwt0cg2 ju367v7a ju367v7v";
var sidebar = "_1vwt0cg3";
var sidebarCompactMode = "_1vwt0cg4";

// src/components/QRCode/QRCode.tsx
function QRCode({
  ecc = "medium",
  logoBackground,
  // biome-ignore lint/correctness/noUnusedVariables: API compatibility
  logoSize = 50,
  logoUrl,
  size: sizeProp = 200,
  uri
}) {
  const padding = "20";
  const size = sizeProp - Number.parseInt(padding, 10) * 2;
  const resolvedLogoUrl = useAsyncImage(logoUrl);
  return /* @__PURE__ */ React51.createElement(
    Box,
    {
      borderColor: "generalBorder",
      borderRadius: "menuButton",
      borderStyle: "solid",
      borderWidth: "1",
      className: QRCodeBackgroundClassName,
      padding,
      width: "max"
    },
    /* @__PURE__ */ React51.createElement(
      Box,
      {
        style: {
          height: size,
          userSelect: "none",
          width: size
        },
        userSelect: "none"
      },
      /* @__PURE__ */ React51.createElement(Cuer.Root, { errorCorrection: ecc, size, value: uri }, /* @__PURE__ */ React51.createElement(Cuer.Cells, { radius: 1 }), /* @__PURE__ */ React51.createElement(Cuer.Finder, { radius: 0.25 }), resolvedLogoUrl && /* @__PURE__ */ React51.createElement(Cuer.Arena, null, /* @__PURE__ */ React51.createElement(
        "img",
        {
          alt: "Wallet Logo",
          src: resolvedLogoUrl,
          style: {
            objectFit: "cover",
            height: "88%",
            width: "88%",
            borderRadius: "22.5%",
            backgroundColor: logoBackground
          }
        }
      )))
    )
  );
}

// src/components/ConnectOptions/ConnectDetails.tsx
var getBrowserSrc = async () => {
  const browser = getBrowser();
  switch (browser) {
    case "Arc" /* Arc */:
      return (await import("./Arc-VDBY7LNS.js")).default;
    case "Brave" /* Brave */:
      return (await import("./Brave-BRAKJXDS.js")).default;
    case "Chrome" /* Chrome */:
      return (await import("./Chrome-65Q5P54Y.js")).default;
    case "Edge" /* Edge */:
      return (await import("./Edge-XSPUTORV.js")).default;
    case "Firefox" /* Firefox */:
      return (await import("./Firefox-AAHGJQIP.js")).default;
    case "Opera" /* Opera */:
      return (await import("./Opera-KQZLSACL.js")).default;
    case "Safari" /* Safari */:
      return (await import("./Safari-ZPL37GXR.js")).default;
    default:
      return (await import("./Browser-76IHF3Y2.js")).default;
  }
};
var preloadBrowserIcon = () => loadImages(getBrowserSrc);
var getPlatformSrc = async () => {
  const platform = getPlatform();
  switch (platform) {
    case "Windows" /* Windows */:
      return (await import("./Windows-PPTHQER6.js")).default;
    case "macOS" /* MacOS */:
      return (await import("./Macos-MW4AE7LN.js")).default;
    case "Linux" /* Linux */:
      return (await import("./Linux-OO4TNCLJ.js")).default;
    default:
      return (await import("./Linux-OO4TNCLJ.js")).default;
  }
};
var preloadPlatformIcon = () => loadImages(getPlatformSrc);
function GetDetail({
  getWalletDownload,
  compactModeEnabled
}) {
  const wallets = useWalletConnectors().filter(
    (wallet) => wallet.isRainbowKitConnector
  );
  const shownWallets = wallets.splice(0, 5);
  const { i18n: i18n2 } = useContext15(I18nContext);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      height: "full",
      marginTop: "18",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "28",
        height: "full",
        width: "full"
      },
      shownWallets?.filter(
        (wallet) => wallet.extensionDownloadUrl || wallet.desktopDownloadUrl || wallet.qrCode && wallet.downloadUrls?.qrCode
      ).map((wallet) => {
        const { downloadUrls, iconBackground, iconUrl, id, name, qrCode } = wallet;
        const hasMobileCompanionApp = downloadUrls?.qrCode && qrCode;
        const hasExtension = !!wallet.extensionDownloadUrl;
        const hasMobileAndExtension = downloadUrls?.qrCode && hasExtension;
        const hasMobileAndDesktop = downloadUrls?.qrCode && !!wallet.desktopDownloadUrl;
        return /* @__PURE__ */ React52.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            gap: "16",
            justifyContent: "space-between",
            key: wallet.id,
            width: "full"
          },
          /* @__PURE__ */ React52.createElement(
            Box,
            {
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              gap: "16"
            },
            /* @__PURE__ */ React52.createElement(
              AsyncImage,
              {
                background: iconBackground,
                borderColor: "actionButtonBorder",
                borderRadius: "10",
                height: "48",
                src: iconUrl,
                width: "48"
              }
            ),
            /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", gap: "2" }, /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, name), /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, hasMobileAndExtension ? i18n2.t("get.mobile_and_extension.description") : hasMobileAndDesktop ? i18n2.t("get.mobile_and_desktop.description") : hasMobileCompanionApp ? i18n2.t("get.mobile.description") : hasExtension ? i18n2.t("get.extension.description") : null))
          ),
          /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React52.createElement(
            ActionButton,
            {
              label: i18n2.t("get.action.label"),
              onClick: () => getWalletDownload(id),
              type: "secondary"
            }
          ))
        );
      })
    ),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        borderRadius: "10",
        display: "flex",
        flexDirection: "column",
        gap: "8",
        justifyContent: "space-between",
        marginBottom: "4",
        paddingY: "8",
        style: { maxWidth: 275, textAlign: "center" }
      },
      /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t("get.looking_for.title")),
      /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, compactModeEnabled ? i18n2.t("get.looking_for.desktop.compact_description") : i18n2.t("get.looking_for.desktop.wide_description"))
    )
  );
}
var LOGO_SIZE = "44";
function ConnectDetail({
  changeWalletStep,
  compactModeEnabled,
  connectionError,
  onClose,
  qrCodeUri,
  reconnect,
  wallet
}) {
  const {
    downloadUrls,
    iconBackground,
    iconUrl,
    name,
    qrCode,
    ready,
    showWalletConnectModal,
    getDesktopUri
  } = wallet;
  const isDesktopDeepLinkAvailable = !!getDesktopUri;
  const safari = isSafari();
  const { i18n: i18n2 } = useContext15(I18nContext);
  const hasExtension = !!wallet.extensionDownloadUrl;
  const hasQrCodeAndExtension = downloadUrls?.qrCode && hasExtension;
  const hasQrCodeAndDesktop = downloadUrls?.qrCode && !!wallet.desktopDownloadUrl;
  const hasQrCode = qrCode && qrCodeUri;
  const onDesktopUri = async () => {
    const uri = await getDesktopUri?.();
    window.open(uri, safari ? "_blank" : "_self");
  };
  const secondaryAction = showWalletConnectModal ? {
    description: !compactModeEnabled ? i18n2.t("connect.walletconnect.description.full") : i18n2.t("connect.walletconnect.description.compact"),
    label: i18n2.t("connect.walletconnect.open.label"),
    onClick: () => {
      onClose();
      showWalletConnectModal();
    }
  } : hasQrCode ? {
    description: i18n2.t("connect.secondary_action.get.description", {
      wallet: name
    }),
    label: i18n2.t("connect.secondary_action.get.label"),
    onClick: () => changeWalletStep(
      hasQrCodeAndExtension || hasQrCodeAndDesktop ? "DOWNLOAD_OPTIONS" /* DownloadOptions */ : "DOWNLOAD" /* Download */
    )
  } : null;
  const { width: windowWidth } = useWindowSize();
  const smallWindow = windowWidth && windowWidth < 768;
  useEffect14(() => {
    preloadBrowserIcon();
    preloadPlatformIcon();
  }, []);
  return /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", height: "full", width: "full" }, hasQrCode ? /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      height: "full",
      justifyContent: "center"
    },
    /* @__PURE__ */ React52.createElement(
      QRCode,
      {
        logoBackground: iconBackground,
        logoSize: compactModeEnabled ? 60 : 72,
        logoUrl: iconUrl,
        size: compactModeEnabled ? 318 : smallWindow ? Math.max(280, Math.min(windowWidth - 308, 382)) : 382,
        uri: qrCodeUri
      }
    )
  ) : /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      style: { flexGrow: 1 }
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8"
      },
      /* @__PURE__ */ React52.createElement(Box, { borderRadius: "10", height: LOGO_SIZE, overflow: "hidden" }, /* @__PURE__ */ React52.createElement(
        AsyncImage,
        {
          useAsImage: !wallet.isRainbowKitConnector,
          height: LOGO_SIZE,
          src: iconUrl,
          width: LOGO_SIZE
        }
      )),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "4",
          paddingX: "32",
          style: { textAlign: "center" }
        },
        /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "18", weight: "bold" }, ready ? i18n2.t("connect.status.opening", {
          wallet: name
        }) : hasExtension ? i18n2.t("connect.status.not_installed", {
          wallet: name
        }) : i18n2.t("connect.status.not_available", {
          wallet: name
        })),
        !ready && hasExtension ? /* @__PURE__ */ React52.createElement(Box, { paddingTop: "20" }, /* @__PURE__ */ React52.createElement(
          ActionButton,
          {
            href: wallet.extensionDownloadUrl,
            label: i18n2.t("connect.secondary_action.install.label"),
            type: "secondary"
          }
        )) : null,
        ready && !hasQrCode && /* @__PURE__ */ React52.createElement(React52.Fragment, null, /* @__PURE__ */ React52.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          },
          /* @__PURE__ */ React52.createElement(
            Text,
            {
              color: "modalTextSecondary",
              size: "14",
              textAlign: "center",
              weight: "medium"
            },
            i18n2.t("connect.status.confirm")
          )
        ), /* @__PURE__ */ React52.createElement(
          Box,
          {
            alignItems: "center",
            color: "modalText",
            display: "flex",
            flexDirection: "row",
            height: "32",
            marginTop: "8"
          },
          connectionError ? /* @__PURE__ */ React52.createElement(
            ActionButton,
            {
              label: i18n2.t("connect.secondary_action.retry.label"),
              onClick: async () => {
                if (isDesktopDeepLinkAvailable) onDesktopUri();
                reconnect(wallet);
              }
            }
          ) : /* @__PURE__ */ React52.createElement(Box, { color: "modalTextSecondary" }, /* @__PURE__ */ React52.createElement(SpinnerIcon, null))
        ))
      )
    )
  ), /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      borderRadius: "10",
      display: "flex",
      flexDirection: "row",
      gap: "8",
      height: "28",
      justifyContent: "space-between",
      marginTop: "12"
    },
    ready && secondaryAction && /* @__PURE__ */ React52.createElement(React52.Fragment, null, /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, secondaryAction.description), /* @__PURE__ */ React52.createElement(
      ActionButton,
      {
        label: secondaryAction.label,
        onClick: secondaryAction.onClick,
        type: "secondary"
      }
    ))
  ));
}
var DownloadOptionsBox = ({
  actionLabel,
  description,
  iconAccent,
  iconBackground,
  iconUrl,
  isCompact,
  onAction,
  title,
  url,
  variant
}) => {
  const isBrowserCard = variant === "browser";
  const gradientRgbas = !isBrowserCard && iconAccent && getGradientRGBAs(iconAccent);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      borderRadius: "13",
      display: "flex",
      justifyContent: "center",
      overflow: "hidden",
      paddingX: isCompact ? "18" : "44",
      position: "relative",
      style: { flex: 1, isolation: "isolate" },
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        borderColor: "actionButtonBorder",
        borderRadius: "13",
        borderStyle: "solid",
        borderWidth: "1",
        style: {
          bottom: "0",
          left: "0",
          position: "absolute",
          right: "0",
          top: "0",
          zIndex: 1
        }
      }
    ),
    isBrowserCard && /* @__PURE__ */ React52.createElement(
      Box,
      {
        background: "downloadTopCardBackground",
        height: "full",
        position: "absolute",
        style: {
          zIndex: 0
        },
        width: "full"
      },
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          style: {
            bottom: "0",
            filter: "blur(20px)",
            left: "0",
            position: "absolute",
            right: "0",
            top: "0",
            transform: "translate3d(0, 0, 0)"
          }
        },
        /* @__PURE__ */ React52.createElement(
          Box,
          {
            style: {
              filter: "blur(100px)",
              marginLeft: -27,
              marginTop: -20,
              opacity: 0.6,
              transform: "translate3d(0, 0, 0)"
            }
          },
          /* @__PURE__ */ React52.createElement(
            AsyncImage,
            {
              borderRadius: "full",
              height: "200",
              src: iconUrl,
              width: "200"
            }
          )
        ),
        /* @__PURE__ */ React52.createElement(
          Box,
          {
            style: {
              filter: "blur(100px)",
              marginRight: 0,
              marginTop: 105,
              opacity: 0.6,
              overflow: "auto",
              transform: "translate3d(0, 0, 0)"
            }
          },
          /* @__PURE__ */ React52.createElement(
            AsyncImage,
            {
              borderRadius: "full",
              height: "200",
              src: iconUrl,
              width: "200"
            }
          )
        )
      )
    ),
    !isBrowserCard && gradientRgbas && /* @__PURE__ */ React52.createElement(
      Box,
      {
        background: "downloadBottomCardBackground",
        style: {
          bottom: "0",
          left: "0",
          position: "absolute",
          right: "0",
          top: "0"
        }
      },
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          position: "absolute",
          style: {
            background: `radial-gradient(50% 50% at 50% 50%, ${gradientRgbas[0]} 0%, ${gradientRgbas[1]} 25%, rgba(0,0,0,0) 100%)`,
            height: 564,
            left: -215,
            top: -197,
            transform: "translate3d(0, 0, 0)",
            width: 564
          }
        }
      ),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          position: "absolute",
          style: {
            background: `radial-gradient(50% 50% at 50% 50%, ${gradientRgbas[2]} 0%, rgba(0, 0, 0, 0) 100%)`,
            height: 564,
            left: -1,
            top: -76,
            transform: "translate3d(0, 0, 0)",
            width: 564
          }
        }
      )
    ),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "flex-start",
        display: "flex",
        flexDirection: "row",
        gap: "24",
        height: "max",
        justifyContent: "center",
        style: { zIndex: 1 }
      },
      /* @__PURE__ */ React52.createElement(Box, null, /* @__PURE__ */ React52.createElement(
        AsyncImage,
        {
          height: "60",
          src: iconUrl,
          width: "60",
          ...iconBackground ? {
            background: iconBackground,
            borderColor: "generalBorder",
            borderRadius: "10"
          } : null
        }
      )),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          display: "flex",
          flexDirection: "column",
          gap: "4",
          style: { flex: 1 },
          width: "full"
        },
        /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, title),
        /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, description),
        /* @__PURE__ */ React52.createElement(Box, { marginTop: "14", width: "max" }, /* @__PURE__ */ React52.createElement(
          ActionButton,
          {
            href: url,
            label: actionLabel,
            onClick: onAction,
            size: "medium"
          }
        ))
      )
    )
  );
};
function DownloadOptionsDetail({
  changeWalletStep,
  wallet
}) {
  const browser = getBrowser();
  const platform = getPlatform();
  const modalSize = useContext15(ModalSizeContext);
  const isCompact = modalSize === "compact";
  const {
    desktop,
    desktopDownloadUrl,
    extension,
    extensionDownloadUrl,
    mobileDownloadUrl
  } = wallet;
  const { i18n: i18n2 } = useContext15(I18nContext);
  useEffect14(() => {
    preloadCreateIcon();
    preloadScanIcon();
    preloadRefreshIcon();
    preloadConnectIcon();
  }, []);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "24",
      height: "full",
      marginBottom: "8",
      marginTop: "4",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "8",
        height: "full",
        justifyContent: "center",
        width: "full"
      },
      extensionDownloadUrl && /* @__PURE__ */ React52.createElement(
        DownloadOptionsBox,
        {
          actionLabel: i18n2.t("get_options.extension.download.label", {
            browser
          }),
          description: i18n2.t("get_options.extension.description"),
          iconUrl: getBrowserSrc,
          isCompact,
          onAction: () => changeWalletStep(
            extension?.instructions ? "INSTRUCTIONS_EXTENSION" /* InstructionsExtension */ : "CONNECT" /* Connect */
          ),
          title: i18n2.t("get_options.extension.title", {
            wallet: wallet.name,
            browser
          }),
          url: extensionDownloadUrl,
          variant: "browser"
        }
      ),
      desktopDownloadUrl && /* @__PURE__ */ React52.createElement(
        DownloadOptionsBox,
        {
          actionLabel: i18n2.t("get_options.desktop.download.label", {
            platform
          }),
          description: i18n2.t("get_options.desktop.description"),
          iconUrl: getPlatformSrc,
          isCompact,
          onAction: () => changeWalletStep(
            desktop?.instructions ? "INSTRUCTIONS_DESKTOP" /* InstructionsDesktop */ : "CONNECT" /* Connect */
          ),
          title: i18n2.t("get_options.desktop.title", {
            wallet: wallet.name,
            platform
          }),
          url: desktopDownloadUrl,
          variant: "desktop"
        }
      ),
      mobileDownloadUrl && /* @__PURE__ */ React52.createElement(
        DownloadOptionsBox,
        {
          actionLabel: i18n2.t("get_options.mobile.download.label", {
            wallet: wallet.name
          }),
          description: i18n2.t("get_options.mobile.description"),
          iconAccent: wallet.iconAccent,
          iconBackground: wallet.iconBackground,
          iconUrl: wallet.iconUrl,
          isCompact,
          onAction: () => {
            changeWalletStep("DOWNLOAD" /* Download */);
          },
          title: i18n2.t("get_options.mobile.title", { wallet: wallet.name }),
          variant: "app"
        }
      )
    )
  );
}
function DownloadDetail({
  changeWalletStep,
  wallet
}) {
  const { downloadUrls, qrCode } = wallet;
  const { i18n: i18n2 } = useContext15(I18nContext);
  useEffect14(() => {
    preloadCreateIcon();
    preloadScanIcon();
  }, []);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      gap: "24",
      height: "full",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(Box, { style: { maxWidth: 220, textAlign: "center" } }, /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "semibold" }, i18n2.t("get_mobile.description"))),
    /* @__PURE__ */ React52.createElement(Box, { height: "full" }, downloadUrls?.qrCode ? /* @__PURE__ */ React52.createElement(QRCode, { logoSize: 0, size: 268, uri: downloadUrls.qrCode }) : null),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        borderRadius: "10",
        display: "flex",
        flexDirection: "row",
        gap: "8",
        height: "34",
        justifyContent: "space-between",
        marginBottom: "12",
        paddingY: "8"
      },
      /* @__PURE__ */ React52.createElement(
        ActionButton,
        {
          label: i18n2.t("get_mobile.continue.label"),
          onClick: () => changeWalletStep(
            qrCode?.instructions ? "INSTRUCTIONS_MOBILE" /* InstructionsMobile */ : "CONNECT" /* Connect */
          )
        }
      )
    )
  );
}
var stepIcons = {
  connect: () => /* @__PURE__ */ React52.createElement(ConnectIcon, null),
  create: () => /* @__PURE__ */ React52.createElement(CreateIcon, null),
  install: (wallet) => /* @__PURE__ */ React52.createElement(
    AsyncImage,
    {
      background: wallet.iconBackground,
      borderColor: "generalBorder",
      borderRadius: "10",
      height: "48",
      src: wallet.iconUrl,
      width: "48"
    }
  ),
  refresh: () => /* @__PURE__ */ React52.createElement(RefreshIcon, null),
  scan: () => /* @__PURE__ */ React52.createElement(ScanIcon, null)
};
function InstructionMobileDetail({
  connectWallet,
  wallet
}) {
  const { i18n: i18n2 } = useContext15(I18nContext);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      height: "full",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        gap: "28",
        height: "full",
        justifyContent: "center",
        paddingY: "32",
        style: { maxWidth: 320 }
      },
      wallet?.qrCode?.instructions?.steps.map((d, idx) => /* @__PURE__ */ React52.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          gap: "16",
          key: idx
        },
        /* @__PURE__ */ React52.createElement(
          Box,
          {
            borderRadius: "10",
            height: "48",
            minWidth: "48",
            overflow: "hidden",
            position: "relative",
            width: "48"
          },
          stepIcons[d.step]?.(wallet)
        ),
        /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t(d.title, void 0, {
          rawKeyIfTranslationMissing: true
        })), /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t(d.description, void 0, {
          rawKeyIfTranslationMissing: true
        })))
      ))
    ),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12",
        justifyContent: "center",
        marginBottom: "16"
      },
      /* @__PURE__ */ React52.createElement(
        ActionButton,
        {
          label: i18n2.t("get_instructions.mobile.connect.label"),
          onClick: () => connectWallet(wallet)
        }
      ),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          as: "a",
          className: touchableStyles({ active: "shrink", hover: "grow" }),
          display: "block",
          href: wallet?.qrCode?.instructions?.learnMoreUrl,
          paddingX: "12",
          paddingY: "4",
          rel: "noreferrer",
          style: { willChange: "transform" },
          target: "_blank",
          transition: "default"
        },
        /* @__PURE__ */ React52.createElement(Text, { color: "accentColor", size: "14", weight: "bold" }, i18n2.t("get_instructions.mobile.learn_more.label"))
      )
    )
  );
}
function InstructionExtensionDetail({
  wallet
}) {
  const { i18n: i18n2 } = useContext15(I18nContext);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      height: "full",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        gap: "28",
        height: "full",
        justifyContent: "center",
        paddingY: "32",
        style: { maxWidth: 320 }
      },
      wallet?.extension?.instructions?.steps.map((d, idx) => /* @__PURE__ */ React52.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          gap: "16",
          key: idx
        },
        /* @__PURE__ */ React52.createElement(
          Box,
          {
            borderRadius: "10",
            height: "48",
            minWidth: "48",
            overflow: "hidden",
            position: "relative",
            width: "48"
          },
          stepIcons[d.step]?.(wallet)
        ),
        /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t(d.title, void 0, {
          rawKeyIfTranslationMissing: true
        })), /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t(d.description, void 0, {
          rawKeyIfTranslationMissing: true
        })))
      ))
    ),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12",
        justifyContent: "center",
        marginBottom: "16"
      },
      /* @__PURE__ */ React52.createElement(
        ActionButton,
        {
          label: i18n2.t("get_instructions.extension.refresh.label"),
          onClick: window.location.reload.bind(window.location)
        }
      ),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          as: "a",
          className: touchableStyles({ active: "shrink", hover: "grow" }),
          display: "block",
          href: wallet?.extension?.instructions?.learnMoreUrl,
          paddingX: "12",
          paddingY: "4",
          rel: "noreferrer",
          style: { willChange: "transform" },
          target: "_blank",
          transition: "default"
        },
        /* @__PURE__ */ React52.createElement(Text, { color: "accentColor", size: "14", weight: "bold" }, i18n2.t("get_instructions.extension.learn_more.label"))
      )
    )
  );
}
function InstructionDesktopDetail({
  connectWallet,
  wallet
}) {
  const { i18n: i18n2 } = useContext15(I18nContext);
  return /* @__PURE__ */ React52.createElement(
    Box,
    {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      height: "full",
      width: "full"
    },
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        gap: "28",
        height: "full",
        justifyContent: "center",
        paddingY: "32",
        style: { maxWidth: 320 }
      },
      wallet?.desktop?.instructions?.steps.map((d, idx) => /* @__PURE__ */ React52.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          gap: "16",
          key: idx
        },
        /* @__PURE__ */ React52.createElement(
          Box,
          {
            borderRadius: "10",
            height: "48",
            minWidth: "48",
            overflow: "hidden",
            position: "relative",
            width: "48"
          },
          stepIcons[d.step]?.(wallet)
        ),
        /* @__PURE__ */ React52.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, /* @__PURE__ */ React52.createElement(Text, { color: "modalText", size: "14", weight: "bold" }, i18n2.t(d.title, void 0, {
          rawKeyIfTranslationMissing: true
        })), /* @__PURE__ */ React52.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t(d.description, void 0, {
          rawKeyIfTranslationMissing: true
        })))
      ))
    ),
    /* @__PURE__ */ React52.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "12",
        justifyContent: "center",
        marginBottom: "16"
      },
      /* @__PURE__ */ React52.createElement(
        ActionButton,
        {
          label: i18n2.t("get_instructions.desktop.connect.label"),
          onClick: () => connectWallet(wallet)
        }
      ),
      /* @__PURE__ */ React52.createElement(
        Box,
        {
          as: "a",
          className: touchableStyles({ active: "shrink", hover: "grow" }),
          display: "block",
          href: wallet?.desktop?.instructions?.learnMoreUrl,
          paddingX: "12",
          paddingY: "4",
          rel: "noreferrer",
          style: { willChange: "transform" },
          target: "_blank",
          transition: "default"
        },
        /* @__PURE__ */ React52.createElement(Text, { color: "accentColor", size: "14", weight: "bold" }, i18n2.t("get_instructions.desktop.learn_more.label"))
      )
    )
  );
}

// src/components/ConnectOptions/DesktopOptions.tsx
function DesktopOptions({ onClose }) {
  const titleId = "rk_connect_title";
  const [selectedOptionId, setSelectedOptionId] = useState12();
  const [selectedWallet, setSelectedWallet] = useState12();
  const [qrCodeUri, setQrCodeUri] = useState12();
  const hasQrCode = !!selectedWallet?.qrCode && qrCodeUri;
  const [connectionError, setConnectionError] = useState12(false);
  const modalSize = useContext16(ModalSizeContext);
  const compactModeEnabled = modalSize === ModalSizeOptions.COMPACT;
  const { disclaimer: Disclaimer } = useContext16(AppContext);
  const { i18n: i18n2 } = useContext16(I18nContext);
  const safari = isSafari();
  const initialized = useRef4(false);
  const { connector } = useContext16(WalletButtonContext);
  const mergeEIP6963WithRkConnectors = !connector;
  const wallets = useWalletConnectors(mergeEIP6963WithRkConnectors).filter((wallet) => wallet.ready || !!wallet.extensionDownloadUrl).sort((a, b) => a.groupIndex - b.groupIndex);
  const unfilteredWallets = useWalletConnectors();
  const groupedWallets = groupBy(wallets, (wallet) => wallet.groupName);
  const supportedI18nGroupNames = [
    "Recommended",
    "Other",
    "Popular",
    "More",
    "Others",
    "Installed"
  ];
  useEffect15(() => {
    if (connector && !initialized.current) {
      changeWalletStep("CONNECT" /* Connect */);
      selectWallet(connector);
      initialized.current = true;
    }
  }, [connector]);
  const connectToWallet = (wallet) => {
    setConnectionError(false);
    if (wallet.ready) {
      wallet?.connect?.()?.catch(() => {
        setConnectionError(true);
      });
    }
  };
  const onDesktopUri = async (wallet) => {
    const sWallet = wallets.find((w) => wallet.id === w.id);
    if (!sWallet?.getDesktopUri) return;
    setTimeout(async () => {
      const uri = await sWallet?.getDesktopUri?.();
      if (uri) window.open(uri, safari ? "_blank" : "_self");
    }, 0);
  };
  const onQrCode = async (wallet) => {
    const sWallet = wallets.find((w) => wallet.id === w.id);
    const uri = await sWallet?.getQrCodeUri?.();
    setQrCodeUri(uri);
    setTimeout(
      () => {
        setSelectedWallet(sWallet);
        changeWalletStep("CONNECT" /* Connect */);
      },
      uri ? 0 : 50
    );
  };
  const selectWallet = async (wallet) => {
    addLatestWalletId(wallet.id);
    if (wallet.ready) {
      onQrCode(wallet);
      onDesktopUri(wallet);
    }
    connectToWallet(wallet);
    setSelectedOptionId(wallet.id);
    if (!wallet.ready) {
      setSelectedWallet(wallet);
      changeWalletStep(
        wallet?.extensionDownloadUrl ? "DOWNLOAD_OPTIONS" /* DownloadOptions */ : "CONNECT" /* Connect */
      );
    }
  };
  const getWalletDownload = (id) => {
    const sWallet = unfilteredWallets.find((w) => id === w.id);
    const isMobile2 = sWallet?.downloadUrls?.qrCode;
    const isDesktop = !!sWallet?.desktopDownloadUrl;
    const isExtension = !!sWallet?.extensionDownloadUrl;
    setSelectedWallet(sWallet);
    if (isMobile2 && (isExtension || isDesktop)) {
      changeWalletStep("DOWNLOAD_OPTIONS" /* DownloadOptions */);
    } else if (isMobile2) {
      changeWalletStep("DOWNLOAD" /* Download */);
    } else if (isDesktop) {
      changeWalletStep("INSTRUCTIONS_DESKTOP" /* InstructionsDesktop */);
    } else {
      changeWalletStep("INSTRUCTIONS_EXTENSION" /* InstructionsExtension */);
    }
  };
  const clearSelectedWallet = () => {
    setSelectedOptionId(void 0);
    setSelectedWallet(void 0);
    setQrCodeUri(void 0);
  };
  const changeWalletStep = (newWalletStep, isBack = false) => {
    if (isBack && newWalletStep === "GET" /* Get */ && initialWalletStep === "GET" /* Get */) {
      clearSelectedWallet();
    } else if (!isBack && newWalletStep === "GET" /* Get */) {
      setInitialWalletStep("GET" /* Get */);
    } else if (!isBack && newWalletStep === "CONNECT" /* Connect */) {
      setInitialWalletStep("CONNECT" /* Connect */);
    }
    setWalletStep(newWalletStep);
  };
  const [initialWalletStep, setInitialWalletStep] = useState12(
    "NONE" /* None */
  );
  const [walletStep, setWalletStep] = useState12("NONE" /* None */);
  let walletContent = null;
  let headerLabel = null;
  let headerBackButtonLink = null;
  let headerBackButtonCallback;
  useEffect15(() => {
    setConnectionError(false);
  }, [walletStep, selectedWallet]);
  const hasExtension = !!selectedWallet?.extensionDownloadUrl;
  const hasExtensionAndMobile = !!(hasExtension && selectedWallet?.mobileDownloadUrl);
  switch (walletStep) {
    case "NONE" /* None */:
      walletContent = /* @__PURE__ */ React53.createElement(ConnectModalIntro, { getWallet: () => changeWalletStep("GET" /* Get */) });
      break;
    case "LEARN_COMPACT" /* LearnCompact */:
      walletContent = /* @__PURE__ */ React53.createElement(
        ConnectModalIntro,
        {
          compactModeEnabled,
          getWallet: () => changeWalletStep("GET" /* Get */)
        }
      );
      headerLabel = i18n2.t("intro.title");
      headerBackButtonLink = "NONE" /* None */;
      break;
    case "GET" /* Get */:
      walletContent = /* @__PURE__ */ React53.createElement(
        GetDetail,
        {
          getWalletDownload,
          compactModeEnabled
        }
      );
      headerLabel = i18n2.t("get.title");
      headerBackButtonLink = compactModeEnabled ? "LEARN_COMPACT" /* LearnCompact */ : "NONE" /* None */;
      break;
    case "CONNECT" /* Connect */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(
        ConnectDetail,
        {
          changeWalletStep,
          compactModeEnabled,
          connectionError,
          onClose,
          qrCodeUri,
          reconnect: connectToWallet,
          wallet: selectedWallet
        }
      );
      headerLabel = hasQrCode && (selectedWallet.name === "WalletConnect" ? i18n2.t("connect_scan.fallback_title") : i18n2.t("connect_scan.title", {
        wallet: selectedWallet.name
      }));
      headerBackButtonLink = compactModeEnabled ? connector ? null : "NONE" /* None */ : null;
      headerBackButtonCallback = compactModeEnabled ? !connector ? clearSelectedWallet : () => {
      } : () => {
      };
      break;
    case "DOWNLOAD_OPTIONS" /* DownloadOptions */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(
        DownloadOptionsDetail,
        {
          changeWalletStep,
          wallet: selectedWallet
        }
      );
      headerLabel = selectedWallet && i18n2.t("get_options.short_title", { wallet: selectedWallet.name });
      headerBackButtonLink = connector ? "CONNECT" /* Connect */ : compactModeEnabled ? "NONE" /* None */ : initialWalletStep;
      break;
    case "DOWNLOAD" /* Download */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(
        DownloadDetail,
        {
          changeWalletStep,
          wallet: selectedWallet
        }
      );
      headerLabel = selectedWallet && i18n2.t("get_mobile.title", { wallet: selectedWallet.name });
      headerBackButtonLink = hasExtensionAndMobile ? "DOWNLOAD_OPTIONS" /* DownloadOptions */ : initialWalletStep;
      break;
    case "INSTRUCTIONS_MOBILE" /* InstructionsMobile */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(
        InstructionMobileDetail,
        {
          connectWallet: selectWallet,
          wallet: selectedWallet
        }
      );
      headerLabel = selectedWallet && i18n2.t("get_options.title", {
        wallet: compactModeEnabled ? selectedWallet.shortName || selectedWallet.name : selectedWallet.name
      });
      headerBackButtonLink = "DOWNLOAD" /* Download */;
      break;
    case "INSTRUCTIONS_EXTENSION" /* InstructionsExtension */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(InstructionExtensionDetail, { wallet: selectedWallet });
      headerLabel = selectedWallet && i18n2.t("get_options.title", {
        wallet: compactModeEnabled ? selectedWallet.shortName || selectedWallet.name : selectedWallet.name
      });
      headerBackButtonLink = "DOWNLOAD_OPTIONS" /* DownloadOptions */;
      break;
    case "INSTRUCTIONS_DESKTOP" /* InstructionsDesktop */:
      walletContent = selectedWallet && /* @__PURE__ */ React53.createElement(
        InstructionDesktopDetail,
        {
          connectWallet: selectWallet,
          wallet: selectedWallet
        }
      );
      headerLabel = selectedWallet && i18n2.t("get_options.title", {
        wallet: compactModeEnabled ? selectedWallet.shortName || selectedWallet.name : selectedWallet.name
      });
      headerBackButtonLink = "DOWNLOAD_OPTIONS" /* DownloadOptions */;
      break;
    default:
      break;
  }
  return /* @__PURE__ */ React53.createElement(
    Box,
    {
      display: "flex",
      flexDirection: "row",
      style: { maxHeight: compactModeEnabled ? 468 : 504 }
    },
    (compactModeEnabled ? walletStep === "NONE" /* None */ : true) && /* @__PURE__ */ React53.createElement(
      Box,
      {
        className: compactModeEnabled ? sidebarCompactMode : sidebar,
        display: "flex",
        flexDirection: "column",
        marginTop: "16"
      },
      /* @__PURE__ */ React53.createElement(Box, { display: "flex", justifyContent: "space-between" }, compactModeEnabled && Disclaimer && /* @__PURE__ */ React53.createElement(Box, { marginLeft: "16", width: "28" }, /* @__PURE__ */ React53.createElement(
        InfoButton,
        {
          onClick: () => changeWalletStep("LEARN_COMPACT" /* LearnCompact */)
        }
      )), compactModeEnabled && !Disclaimer && /* @__PURE__ */ React53.createElement(Box, { marginLeft: "16", width: "28" }), /* @__PURE__ */ React53.createElement(
        Box,
        {
          marginLeft: compactModeEnabled ? "0" : "6",
          paddingBottom: "8",
          paddingTop: "2",
          paddingX: "18"
        },
        /* @__PURE__ */ React53.createElement(
          Text,
          {
            as: "h1",
            color: "modalText",
            id: titleId,
            size: "18",
            weight: "heavy",
            testId: "connect-header-label"
          },
          i18n2.t("connect.title")
        )
      ), compactModeEnabled && /* @__PURE__ */ React53.createElement(Box, { marginRight: "16" }, /* @__PURE__ */ React53.createElement(CloseButton, { onClose }))),
      /* @__PURE__ */ React53.createElement(Box, { className: ScrollClassName, paddingBottom: "18" }, Object.entries(groupedWallets).map(
        ([groupName, wallets2], index) => wallets2.length > 0 && /* @__PURE__ */ React53.createElement(Fragment2, { key: index }, groupName ? /* @__PURE__ */ React53.createElement(Box, { marginBottom: "8", marginTop: "16", marginX: "6" }, /* @__PURE__ */ React53.createElement(
          Text,
          {
            color: groupName === "Installed" ? "accentColor" : "modalTextSecondary",
            size: "14",
            weight: "bold"
          },
          supportedI18nGroupNames.includes(groupName) ? i18n2.t(
            `connector_group.${groupName.toLowerCase()}`
          ) : groupName
        )) : null, /* @__PURE__ */ React53.createElement(Box, { display: "flex", flexDirection: "column", gap: "4" }, wallets2.map((wallet) => {
          return /* @__PURE__ */ React53.createElement(
            ModalSelection,
            {
              currentlySelected: wallet.id === selectedOptionId,
              iconBackground: wallet.iconBackground,
              iconUrl: wallet.iconUrl,
              key: wallet.id,
              name: wallet.name,
              onClick: () => selectWallet(wallet),
              ready: wallet.ready,
              recent: wallet.recent,
              testId: `wallet-option-${wallet.id}`,
              isRainbowKitConnector: wallet.isRainbowKitConnector
            }
          );
        })))
      )),
      compactModeEnabled && /* @__PURE__ */ React53.createElement(React53.Fragment, null, /* @__PURE__ */ React53.createElement(Box, { background: "generalBorder", height: "1", marginTop: "-1" }), Disclaimer ? /* @__PURE__ */ React53.createElement(Box, { paddingX: "24", paddingY: "16", textAlign: "center" }, /* @__PURE__ */ React53.createElement(Disclaimer, { Link: DisclaimerLink, Text: DisclaimerText })) : /* @__PURE__ */ React53.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          paddingX: "24",
          paddingY: "16"
        },
        /* @__PURE__ */ React53.createElement(Box, { paddingY: "4" }, /* @__PURE__ */ React53.createElement(Text, { color: "modalTextSecondary", size: "14", weight: "medium" }, i18n2.t("connect.new_to_ethereum.description"))),
        /* @__PURE__ */ React53.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            flexDirection: "row",
            gap: "4",
            justifyContent: "center"
          },
          /* @__PURE__ */ React53.createElement(
            Box,
            {
              className: touchableStyles({
                active: "shrink",
                hover: "grow"
              }),
              cursor: "pointer",
              onClick: () => changeWalletStep("LEARN_COMPACT" /* LearnCompact */),
              paddingY: "4",
              style: { willChange: "transform" },
              transition: "default"
            },
            /* @__PURE__ */ React53.createElement(Text, { color: "accentColor", size: "14", weight: "bold" }, i18n2.t("connect.new_to_ethereum.learn_more.label"))
          )
        )
      ))
    ),
    (compactModeEnabled ? walletStep !== "NONE" /* None */ : true) && /* @__PURE__ */ React53.createElement(React53.Fragment, null, !compactModeEnabled && /* @__PURE__ */ React53.createElement(Box, { background: "generalBorder", minWidth: "1", width: "1" }), /* @__PURE__ */ React53.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        margin: "16",
        style: { flexGrow: 1 }
      },
      /* @__PURE__ */ React53.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12"
        },
        /* @__PURE__ */ React53.createElement(Box, { width: "28" }, headerBackButtonLink && /* @__PURE__ */ React53.createElement(
          Box,
          {
            as: "button",
            className: touchableStyles({
              active: "shrinkSm",
              hover: "growLg"
            }),
            color: "accentColor",
            onClick: () => {
              headerBackButtonLink && changeWalletStep(headerBackButtonLink, true);
              headerBackButtonCallback?.();
            },
            paddingX: "8",
            paddingY: "4",
            style: {
              boxSizing: "content-box",
              height: 17,
              willChange: "transform"
            },
            transition: "default",
            type: "button"
          },
          /* @__PURE__ */ React53.createElement(BackIcon, null)
        )),
        /* @__PURE__ */ React53.createElement(
          Box,
          {
            display: "flex",
            justifyContent: "center",
            style: { flexGrow: 1 }
          },
          headerLabel && /* @__PURE__ */ React53.createElement(
            Text,
            {
              color: "modalText",
              size: "18",
              textAlign: "center",
              weight: "heavy"
            },
            headerLabel
          )
        ),
        /* @__PURE__ */ React53.createElement(CloseButton, { onClose })
      ),
      /* @__PURE__ */ React53.createElement(
        Box,
        {
          display: "flex",
          flexDirection: "column",
          style: { minHeight: compactModeEnabled ? 396 : 432 }
        },
        /* @__PURE__ */ React53.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "6",
            height: "full",
            justifyContent: "center",
            marginX: "8"
          },
          walletContent
        )
      )
    ))
  );
}

// src/components/ConnectOptions/MobileOptions.tsx
import React54, {
  useCallback as useCallback9,
  useContext as useContext17,
  useEffect as useEffect16,
  useRef as useRef5,
  useState as useState13
} from "react";

// src/components/ConnectOptions/MobileOptions.css.ts
var rotatingBorder = "_1am14412";
var scroll = "_1am14410";
var spinner = "_1am14413";

// src/components/ConnectOptions/MobileOptions.tsx
var LoadingSpinner = ({ wallet }) => {
  const width = 80;
  const height = 80;
  const radiusFactor = 20;
  const perimeter = 2 * (width + height - 4 * radiusFactor);
  return /* @__PURE__ */ React54.createElement("svg", { className: spinner, viewBox: "0 0 86 86", width: "86", height: "86" }, /* @__PURE__ */ React54.createElement("title", null, "Loading"), /* @__PURE__ */ React54.createElement(
    "rect",
    {
      x: "3",
      y: "3",
      width,
      height,
      rx: radiusFactor,
      ry: radiusFactor,
      strokeDasharray: `${perimeter / 3} ${2 * perimeter / 3}`,
      strokeDashoffset: perimeter,
      className: rotatingBorder,
      style: {
        // Prop style passing works only in `@vanilla-extract/recipes`.
        // Instead downloading packages we can do this
        // manually without passing props
        stroke: wallet?.iconAccent || "#0D3887"
      }
    }
  ));
};
function WalletButton({
  onClose,
  wallet,
  connecting
}) {
  const {
    connect,
    iconBackground,
    iconUrl,
    id,
    name,
    getMobileUri,
    ready,
    shortName,
    showWalletConnectModal
  } = wallet;
  const coolModeRef = useCoolMode(iconUrl);
  const initialized = useRef5(false);
  const { i18n: i18n2 } = useContext17(I18nContext);
  const onConnect = useCallback9(async () => {
    const onMobileUri = async () => {
      const mobileUri = await getMobileUri?.();
      if (!mobileUri) return;
      if (mobileUri) {
        setWalletConnectDeepLink({ mobileUri, name });
      }
      if (mobileUri.startsWith("http")) {
        const link = document.createElement("a");
        link.href = mobileUri;
        link.target = "_blank";
        link.rel = "noreferrer noopener";
        link.click();
      } else {
        window.location.href = mobileUri;
      }
    };
    if (id !== "walletConnect") onMobileUri();
    if (showWalletConnectModal) {
      showWalletConnectModal();
      onClose?.();
      return;
    }
    try {
      await connect?.();
    } catch {
    }
  }, [connect, getMobileUri, showWalletConnectModal, onClose, name, id]);
  useEffect16(() => {
    if (connecting && !initialized.current) {
      onConnect();
      initialized.current = true;
    }
  }, [connecting, onConnect]);
  return /* @__PURE__ */ React54.createElement(
    Box,
    {
      as: "button",
      color: ready ? "modalText" : "modalTextSecondary",
      disabled: !ready,
      fontFamily: "body",
      key: id,
      onClick: onConnect,
      ref: coolModeRef,
      style: { overflow: "visible", textAlign: "center" },
      testId: `wallet-option-${id}`,
      type: "button",
      width: "full"
    },
    /* @__PURE__ */ React54.createElement(
      Box,
      {
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
      },
      /* @__PURE__ */ React54.createElement(
        Box,
        {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: "8",
          paddingTop: "10",
          position: "relative"
        },
        connecting ? /* @__PURE__ */ React54.createElement(LoadingSpinner, { wallet }) : null,
        /* @__PURE__ */ React54.createElement(
          AsyncImage,
          {
            background: iconBackground,
            borderRadius: "13",
            boxShadow: "walletLogo",
            height: "60",
            src: iconUrl,
            width: "60"
          }
        )
      ),
      !connecting ? /* @__PURE__ */ React54.createElement(Box, { display: "flex", flexDirection: "column", textAlign: "center" }, /* @__PURE__ */ React54.createElement(
        Text,
        {
          as: "h2",
          color: wallet.ready ? "modalText" : "modalTextSecondary",
          size: "13",
          weight: "medium"
        },
        /* @__PURE__ */ React54.createElement(Box, { as: "span", position: "relative" }, shortName ?? name, !wallet.ready && " (unsupported)")
      ), wallet.recent && /* @__PURE__ */ React54.createElement(Text, { color: "accentColor", size: "12", weight: "medium" }, i18n2.t("connect.recent"))) : null
    )
  );
}
function MobileOptions({ onClose }) {
  const titleId = "rk_connect_title";
  const wallets = useWalletConnectors().filter(
    (wallet) => wallet.isRainbowKitConnector
  );
  const { disclaimer: Disclaimer, learnMoreUrl } = useContext17(AppContext);
  let headerLabel = null;
  let walletContent = null;
  let headerBackgroundContrast = false;
  let headerBackButtonLink = null;
  const [walletStep, setWalletStep] = useState13(
    "CONNECT" /* Connect */
  );
  const { i18n: i18n2 } = useContext17(I18nContext);
  const ios = isIOS();
  switch (walletStep) {
    case "CONNECT" /* Connect */: {
      headerLabel = i18n2.t("connect.title");
      headerBackgroundContrast = true;
      walletContent = /* @__PURE__ */ React54.createElement(Box, null, /* @__PURE__ */ React54.createElement(
        Box,
        {
          background: "profileForeground",
          className: scroll,
          display: "flex",
          paddingBottom: "20",
          paddingTop: "6",
          paddingX: "20",
          style: {
            // Dynamic gap to show ~13px of 5th wallet as scroll hint
            gap: "calc((100% - 40px - 240px + 47px) / 4)"
          }
        },
        wallets.filter((wallet) => wallet.ready).map((wallet) => {
          return /* @__PURE__ */ React54.createElement(Box, { key: wallet.id, width: "60" }, /* @__PURE__ */ React54.createElement(WalletButton, { onClose, wallet }));
        })
      ), /* @__PURE__ */ React54.createElement(
        Box,
        {
          background: "generalBorder",
          height: "1",
          marginBottom: "32",
          marginTop: "-1"
        }
      ), /* @__PURE__ */ React54.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "32",
          paddingX: "32",
          style: { textAlign: "center" }
        },
        /* @__PURE__ */ React54.createElement(
          Box,
          {
            display: "flex",
            flexDirection: "column",
            gap: "8",
            textAlign: "center"
          },
          /* @__PURE__ */ React54.createElement(Text, { color: "modalText", size: "16", weight: "bold" }, i18n2.t("intro.title")),
          /* @__PURE__ */ React54.createElement(Text, { color: "modalTextSecondary", size: "16" }, i18n2.t("intro.description"))
        )
      ), /* @__PURE__ */ React54.createElement(Box, { paddingTop: "32", paddingX: "20" }, /* @__PURE__ */ React54.createElement(Box, { display: "flex", gap: "14", justifyContent: "center" }, /* @__PURE__ */ React54.createElement(
        ActionButton,
        {
          label: i18n2.t("intro.get.label"),
          onClick: () => setWalletStep("GET" /* Get */),
          size: "large",
          type: "secondary"
        }
      ), /* @__PURE__ */ React54.createElement(
        ActionButton,
        {
          href: learnMoreUrl,
          label: i18n2.t("intro.learn_more.label"),
          size: "large",
          type: "secondary"
        }
      ))), Disclaimer && /* @__PURE__ */ React54.createElement(Box, { marginTop: "28", marginX: "32", textAlign: "center" }, /* @__PURE__ */ React54.createElement(Disclaimer, { Link: DisclaimerLink, Text: DisclaimerText })));
      break;
    }
    case "GET" /* Get */: {
      headerLabel = i18n2.t("get.title");
      headerBackButtonLink = "CONNECT" /* Connect */;
      const mobileWallets = wallets?.filter(
        (wallet) => wallet.downloadUrls?.ios || wallet.downloadUrls?.android || wallet.downloadUrls?.mobile
      )?.splice(0, 3);
      walletContent = /* @__PURE__ */ React54.createElement(Box, null, /* @__PURE__ */ React54.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          height: "full",
          marginBottom: "36",
          marginTop: "5",
          paddingTop: "12",
          width: "full"
        },
        mobileWallets.map((wallet, index) => {
          const { downloadUrls, iconBackground, iconUrl, name } = wallet;
          if (!downloadUrls?.ios && !downloadUrls?.android && !downloadUrls?.mobile) {
            return null;
          }
          return /* @__PURE__ */ React54.createElement(
            Box,
            {
              display: "flex",
              gap: "16",
              key: wallet.id,
              paddingX: "20",
              width: "full"
            },
            /* @__PURE__ */ React54.createElement(Box, { style: { minHeight: 48, minWidth: 48 } }, /* @__PURE__ */ React54.createElement(
              AsyncImage,
              {
                background: iconBackground,
                borderColor: "generalBorder",
                borderRadius: "10",
                height: "48",
                src: iconUrl,
                width: "48"
              }
            )),
            /* @__PURE__ */ React54.createElement(Box, { display: "flex", flexDirection: "column", width: "full" }, /* @__PURE__ */ React54.createElement(Box, { alignItems: "center", display: "flex", height: "48" }, /* @__PURE__ */ React54.createElement(Box, { width: "full" }, /* @__PURE__ */ React54.createElement(Text, { color: "modalText", size: "18", weight: "bold" }, name)), /* @__PURE__ */ React54.createElement(
              ActionButton,
              {
                href: (ios ? downloadUrls?.ios : downloadUrls?.android) || downloadUrls?.mobile,
                label: i18n2.t("get.action.label"),
                size: "small",
                type: "secondary"
              }
            )), index < mobileWallets.length - 1 && /* @__PURE__ */ React54.createElement(
              Box,
              {
                background: "generalBorderDim",
                height: "1",
                marginY: "10",
                width: "full"
              }
            ))
          );
        })
      ), /* @__PURE__ */ React54.createElement(Box, { style: { marginBottom: "42px" } }), /* @__PURE__ */ React54.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: "36",
          paddingX: "36",
          style: { textAlign: "center" }
        },
        /* @__PURE__ */ React54.createElement(
          Box,
          {
            display: "flex",
            flexDirection: "column",
            gap: "12",
            textAlign: "center"
          },
          /* @__PURE__ */ React54.createElement(Text, { color: "modalText", size: "16", weight: "bold" }, i18n2.t("get.looking_for.title")),
          /* @__PURE__ */ React54.createElement(Text, { color: "modalTextSecondary", size: "16" }, i18n2.t("get.looking_for.mobile.description"))
        )
      ));
      break;
    }
  }
  return /* @__PURE__ */ React54.createElement(Box, { display: "flex", flexDirection: "column", paddingBottom: "36" }, /* @__PURE__ */ React54.createElement(
    Box,
    {
      background: headerBackgroundContrast ? "profileForeground" : "modalBackground",
      display: "flex",
      flexDirection: "column",
      paddingBottom: "4",
      paddingTop: "14"
    },
    /* @__PURE__ */ React54.createElement(
      Box,
      {
        display: "flex",
        justifyContent: "center",
        paddingBottom: "6",
        paddingX: "20",
        position: "relative"
      },
      headerBackButtonLink && /* @__PURE__ */ React54.createElement(
        Box,
        {
          display: "flex",
          position: "absolute",
          style: {
            left: 0,
            marginBottom: -20,
            marginTop: -20
          }
        },
        /* @__PURE__ */ React54.createElement(
          Box,
          {
            alignItems: "center",
            as: "button",
            className: touchableStyles({
              active: "shrinkSm",
              hover: "growLg"
            }),
            color: "accentColor",
            display: "flex",
            marginLeft: "4",
            marginTop: "20",
            onClick: () => setWalletStep(headerBackButtonLink),
            padding: "16",
            style: { height: 17, willChange: "transform" },
            transition: "default",
            type: "button"
          },
          /* @__PURE__ */ React54.createElement(BackIcon, null)
        )
      ),
      /* @__PURE__ */ React54.createElement(Box, { marginTop: "4", textAlign: "center", width: "full" }, /* @__PURE__ */ React54.createElement(
        Text,
        {
          as: "h1",
          color: "modalText",
          id: titleId,
          size: "20",
          weight: "bold"
        },
        headerLabel
      )),
      /* @__PURE__ */ React54.createElement(
        Box,
        {
          alignItems: "center",
          display: "flex",
          height: "32",
          paddingRight: "14",
          position: "absolute",
          right: "0"
        },
        /* @__PURE__ */ React54.createElement(
          Box,
          {
            style: { marginBottom: -20, marginTop: -20 }
          },
          /* @__PURE__ */ React54.createElement(CloseButton, { onClose })
        )
      )
    )
  ), /* @__PURE__ */ React54.createElement(Box, { display: "flex", flexDirection: "column" }, walletContent));
}

// src/components/ConnectOptions/MobileStatus.tsx
import React55, { useContext as useContext18 } from "react";
var MobileStatus = ({ onClose }) => {
  const { connector } = useContext18(WalletButtonContext);
  const { i18n: i18n2 } = useContext18(I18nContext);
  const connectorName = connector?.name || "";
  return /* @__PURE__ */ React55.createElement(Box, null, /* @__PURE__ */ React55.createElement(
    Box,
    {
      display: "flex",
      paddingBottom: "32",
      justifyContent: "center",
      alignItems: "center",
      background: "profileForeground",
      flexDirection: "column"
    },
    /* @__PURE__ */ React55.createElement(
      Box,
      {
        width: "full",
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "18",
        marginRight: "24"
      },
      /* @__PURE__ */ React55.createElement(CloseButton, { onClose })
    ),
    /* @__PURE__ */ React55.createElement(Box, { width: "60" }, /* @__PURE__ */ React55.createElement(WalletButton, { onClose, wallet: connector, connecting: true })),
    /* @__PURE__ */ React55.createElement(Box, { marginTop: "20" }, /* @__PURE__ */ React55.createElement(
      Text,
      {
        textAlign: "center",
        color: "modalText",
        size: "18",
        weight: "semibold"
      },
      i18n2.t("connect.status.connect_mobile", {
        wallet: connectorName
      })
    )),
    /* @__PURE__ */ React55.createElement(Box, { maxWidth: "full", marginTop: "8" }, /* @__PURE__ */ React55.createElement(Text, { textAlign: "center", color: "modalText", size: "16", weight: "medium" }, i18n2.t("connect.status.confirm_mobile", {
      wallet: connectorName
    })))
  ));
};

// src/components/ConnectOptions/ConnectOptions.tsx
function ConnectOptions({ onClose }) {
  const { connector } = useContext19(WalletButtonContext);
  return isMobile() ? connector ? /* @__PURE__ */ React56.createElement(MobileStatus, { onClose }) : /* @__PURE__ */ React56.createElement(MobileOptions, { onClose }) : /* @__PURE__ */ React56.createElement(DesktopOptions, { onClose });
}

// src/components/ConnectModal/ConnectModal.tsx
function ConnectModal({ onClose, open }) {
  const titleId = "rk_connect_title";
  const connectionStatus = useConnectionStatus();
  const { disconnect } = useDisconnect3();
  const { isConnecting } = useAccount12();
  const onAuthCancel = React57.useCallback(() => {
    onClose();
    disconnect();
  }, [onClose, disconnect]);
  const onConnectModalCancel = React57.useCallback(() => {
    if (isConnecting) disconnect();
    onClose();
  }, [onClose, disconnect, isConnecting]);
  if (connectionStatus === "disconnected") {
    return /* @__PURE__ */ React57.createElement(Dialog, { onClose: onConnectModalCancel, open, titleId }, /* @__PURE__ */ React57.createElement(DialogContent, { bottomSheetOnMobile: true, padding: "0", wide: true }, /* @__PURE__ */ React57.createElement(ConnectOptions, { onClose: onConnectModalCancel })));
  }
  if (connectionStatus === "unauthenticated") {
    return /* @__PURE__ */ React57.createElement(Dialog, { onClose: onAuthCancel, open, titleId }, /* @__PURE__ */ React57.createElement(DialogContent, { bottomSheetOnMobile: true, padding: "0" }, /* @__PURE__ */ React57.createElement(SignIn, { onClose: onAuthCancel, onCloseModal: onClose })));
  }
  return null;
}

// src/components/RainbowKitProvider/ModalContext.tsx
function useModalStateValue() {
  const [isModalOpen, setModalOpen] = useState14(false);
  return {
    closeModal: useCallback10(() => setModalOpen(false), []),
    isModalOpen,
    openModal: useCallback10(() => setModalOpen(true), [])
  };
}
var ModalContext = createContext12({
  accountModalOpen: false,
  chainModalOpen: false,
  connectModalOpen: false,
  isWalletConnectModalOpen: false,
  setIsWalletConnectModalOpen: () => {
  }
});
function ModalProvider({ children }) {
  const {
    closeModal: closeConnectModal,
    isModalOpen: connectModalOpen,
    openModal: openConnectModal
  } = useModalStateValue();
  const {
    closeModal: closeAccountModal,
    isModalOpen: accountModalOpen,
    openModal: openAccountModal
  } = useModalStateValue();
  const {
    closeModal: closeChainModal,
    isModalOpen: chainModalOpen,
    openModal: openChainModal
  } = useModalStateValue();
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState14(false);
  const connectionStatus = useConnectionStatus();
  const { chainId } = useAccount13();
  const { chains } = useConfig3();
  const isCurrentChainSupported = chains.some((chain) => chain.id === chainId);
  const closeModals = useCallback10(
    ({ keepConnectModalOpen = false } = {}) => {
      if (!keepConnectModalOpen) {
        closeConnectModal();
      }
      closeAccountModal();
      closeChainModal();
    },
    [closeConnectModal, closeAccountModal, closeChainModal]
  );
  const isUnauthenticated = useAuthenticationStatus() === "unauthenticated";
  useAccountEffect3({
    onConnect: () => closeModals({ keepConnectModalOpen: isUnauthenticated }),
    onDisconnect: () => closeModals()
  });
  useEffect17(() => {
    if (isUnauthenticated) closeModals();
  }, [isUnauthenticated, closeModals]);
  return /* @__PURE__ */ React58.createElement(
    ModalContext.Provider,
    {
      value: useMemo7(
        () => ({
          accountModalOpen,
          chainModalOpen,
          connectModalOpen,
          isWalletConnectModalOpen,
          openAccountModal: isCurrentChainSupported && connectionStatus === "connected" ? openAccountModal : void 0,
          openChainModal: connectionStatus === "connected" ? openChainModal : void 0,
          openConnectModal: connectionStatus === "disconnected" || connectionStatus === "unauthenticated" ? openConnectModal : void 0,
          setIsWalletConnectModalOpen
        }),
        [
          connectionStatus,
          accountModalOpen,
          chainModalOpen,
          connectModalOpen,
          openAccountModal,
          openChainModal,
          openConnectModal,
          isCurrentChainSupported,
          isWalletConnectModalOpen
        ]
      )
    },
    children,
    /* @__PURE__ */ React58.createElement(ConnectModal, { onClose: closeConnectModal, open: connectModalOpen }),
    /* @__PURE__ */ React58.createElement(AccountModal, { onClose: closeAccountModal, open: accountModalOpen }),
    /* @__PURE__ */ React58.createElement(ChainModal, { onClose: closeChainModal, open: chainModalOpen })
  );
}
function useModalState() {
  const { accountModalOpen, chainModalOpen, connectModalOpen } = useContext20(ModalContext);
  return {
    accountModalOpen,
    chainModalOpen,
    connectModalOpen
  };
}
function useAccountModal() {
  const { accountModalOpen, openAccountModal } = useContext20(ModalContext);
  return { accountModalOpen, openAccountModal };
}
function useChainModal() {
  const { chainModalOpen, openChainModal } = useContext20(ModalContext);
  return { chainModalOpen, openChainModal };
}
function useWalletConnectOpenState() {
  const { isWalletConnectModalOpen, setIsWalletConnectModalOpen } = useContext20(ModalContext);
  return { isWalletConnectModalOpen, setIsWalletConnectModalOpen };
}
function useConnectModal() {
  const { connectModalOpen, openConnectModal } = useContext20(ModalContext);
  const { isWalletConnectModalOpen } = useWalletConnectOpenState();
  return {
    connectModalOpen: connectModalOpen || isWalletConnectModalOpen,
    openConnectModal
  };
}

// src/components/ConnectButton/ConnectButtonRenderer.tsx
var noop = () => {
};
function ConnectButtonRenderer({
  children
}) {
  const isMounted = useIsMounted();
  const { address } = useAccount14();
  const { chainId } = useAccount14();
  const { chains: wagmiChains } = useConfig4();
  const isCurrentChainSupported = wagmiChains.some(
    (chain) => chain.id === chainId
  );
  const rainbowkitChainsById = useRainbowKitChainsById();
  const authenticationStatus = useAuthenticationStatus() ?? void 0;
  const rainbowKitChain = chainId ? rainbowkitChainsById[chainId] : void 0;
  const chainName = rainbowKitChain?.name ?? void 0;
  const chainIconUrl = rainbowKitChain?.iconUrl ?? void 0;
  const chainIconBackground = rainbowKitChain?.iconBackground ?? void 0;
  const resolvedChainIconUrl = useAsyncImage(chainIconUrl);
  const showRecentTransactions = useContext21(ShowRecentTransactionsContext);
  const hasPendingTransactions = useRecentTransactions().some(({ status }) => status === "pending") && showRecentTransactions;
  const { showBalance } = useShowBalance();
  const computeShouldShowBalance = () => {
    if (typeof showBalance === "boolean") {
      return showBalance;
    }
    if (showBalance) {
      return normalizeResponsiveValue(showBalance)[isMobile() ? "smallScreen" : "largeScreen"];
    }
    return true;
  };
  const shouldShowBalance = computeShouldShowBalance();
  const { balance, ensAvatar, ensName } = useProfile({
    address,
    includeBalance: shouldShowBalance
  });
  const displayBalance = balance ? `${abbreviateETHBalance(Number.parseFloat(balance.formatted))} ${balance.symbol}` : void 0;
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
  const { openAccountModal } = useAccountModal();
  const { accountModalOpen, chainModalOpen, connectModalOpen } = useModalState();
  return /* @__PURE__ */ React59.createElement(React59.Fragment, null, children({
    account: address ? {
      address,
      balanceDecimals: balance?.decimals,
      balanceFormatted: balance?.formatted,
      balanceSymbol: balance?.symbol,
      displayBalance,
      displayName: ensName ? formatENS(ensName) : formatAddress(address),
      ensAvatar: ensAvatar ?? void 0,
      ensName: ensName ?? void 0,
      hasPendingTransactions
    } : void 0,
    accountModalOpen,
    authenticationStatus,
    chain: chainId ? {
      hasIcon: Boolean(chainIconUrl),
      iconBackground: chainIconBackground,
      iconUrl: resolvedChainIconUrl,
      id: chainId,
      name: chainName,
      unsupported: !isCurrentChainSupported
    } : void 0,
    chainModalOpen,
    connectModalOpen,
    mounted: isMounted(),
    openAccountModal: openAccountModal ?? noop,
    openChainModal: openChainModal ?? noop,
    openConnectModal: openConnectModal ?? noop
  }));
}
ConnectButtonRenderer.displayName = "ConnectButton.Custom";

// src/components/ConnectButton/ConnectButton.tsx
var defaultProps = {
  accountStatus: "full",
  chainStatus: { largeScreen: "full", smallScreen: "icon" },
  label: "Connect Wallet",
  showBalance: { largeScreen: true, smallScreen: false }
};
function ConnectButton({
  accountStatus = defaultProps.accountStatus,
  chainStatus = defaultProps.chainStatus,
  label = defaultProps.label,
  showBalance = defaultProps.showBalance
}) {
  const chains = useRainbowKitChains();
  const connectionStatus = useConnectionStatus();
  const { setShowBalance } = useShowBalance();
  const [ready, setReady] = useState15(false);
  const { i18n: i18n2 } = useContext22(I18nContext);
  useEffect18(() => {
    setShowBalance(showBalance);
    if (!ready) setReady(true);
  }, [showBalance, setShowBalance]);
  return ready ? /* @__PURE__ */ React60.createElement(ConnectButtonRenderer, null, ({
    account,
    chain,
    mounted,
    openAccountModal,
    openChainModal,
    openConnectModal
  }) => {
    const ready2 = mounted && connectionStatus !== "loading";
    const unsupportedChain = chain?.unsupported ?? false;
    return /* @__PURE__ */ React60.createElement(
      Box,
      {
        display: "flex",
        gap: "12",
        ...!ready2 && {
          "aria-hidden": true,
          style: {
            opacity: 0,
            pointerEvents: "none",
            userSelect: "none"
          }
        }
      },
      ready2 && account && connectionStatus === "connected" ? /* @__PURE__ */ React60.createElement(React60.Fragment, null, chain && (chains.length > 1 || unsupportedChain) && /* @__PURE__ */ React60.createElement(
        Box,
        {
          alignItems: "center",
          "aria-label": "Chain Selector",
          as: "button",
          background: unsupportedChain ? "connectButtonBackgroundError" : "connectButtonBackground",
          borderRadius: "connectButton",
          boxShadow: "connectButton",
          className: touchableStyles({
            active: "shrink",
            hover: "grow"
          }),
          color: unsupportedChain ? "connectButtonTextError" : "connectButtonText",
          display: mapResponsiveValue(
            chainStatus,
            (value) => value === "none" ? "none" : "flex"
          ),
          fontFamily: "body",
          fontWeight: "bold",
          gap: "6",
          key: (
            // Force re-mount to prevent CSS transition
            unsupportedChain ? "unsupported" : "supported"
          ),
          onClick: openChainModal,
          paddingX: "10",
          paddingY: "8",
          testId: unsupportedChain ? "wrong-network-button" : "chain-button",
          transition: "default",
          type: "button"
        },
        unsupportedChain ? /* @__PURE__ */ React60.createElement(
          Box,
          {
            alignItems: "center",
            display: "flex",
            height: "24",
            paddingX: "4"
          },
          i18n2.t("connect_wallet.wrong_network.label")
        ) : /* @__PURE__ */ React60.createElement(Box, { alignItems: "center", display: "flex", gap: "6" }, chain.hasIcon ? /* @__PURE__ */ React60.createElement(
          Box,
          {
            display: mapResponsiveValue(
              chainStatus,
              (value) => value === "full" || value === "icon" ? "block" : "none"
            ),
            height: "24",
            width: "24"
          },
          /* @__PURE__ */ React60.createElement(
            AsyncImage,
            {
              alt: chain.name ?? "Chain icon",
              background: chain.iconBackground,
              borderRadius: "full",
              height: "24",
              src: chain.iconUrl,
              width: "24"
            }
          )
        ) : null, /* @__PURE__ */ React60.createElement(
          Box,
          {
            display: mapResponsiveValue(chainStatus, (value) => {
              if (value === "icon" && !chain.iconUrl) {
                return "block";
              }
              return value === "full" || value === "name" ? "block" : "none";
            })
          },
          chain.name ?? chain.id
        )),
        /* @__PURE__ */ React60.createElement(DropdownIcon, null)
      ), !unsupportedChain && /* @__PURE__ */ React60.createElement(
        Box,
        {
          alignItems: "center",
          as: "button",
          background: "connectButtonBackground",
          borderRadius: "connectButton",
          boxShadow: "connectButton",
          className: touchableStyles({
            active: "shrink",
            hover: "grow"
          }),
          color: "connectButtonText",
          display: "flex",
          fontFamily: "body",
          fontWeight: "bold",
          onClick: openAccountModal,
          testId: "account-button",
          transition: "default",
          type: "button"
        },
        account.displayBalance && /* @__PURE__ */ React60.createElement(
          Box,
          {
            display: mapResponsiveValue(
              showBalance,
              (value) => value ? "block" : "none"
            ),
            padding: "8",
            paddingLeft: "12"
          },
          account.displayBalance
        ),
        /* @__PURE__ */ React60.createElement(
          Box,
          {
            background: normalizeResponsiveValue(showBalance)[isMobile() ? "smallScreen" : "largeScreen"] ? "connectButtonInnerBackground" : "connectButtonBackground",
            borderColor: "connectButtonBackground",
            borderRadius: "connectButton",
            borderStyle: "solid",
            borderWidth: "2",
            color: "connectButtonText",
            fontFamily: "body",
            fontWeight: "bold",
            paddingX: "8",
            paddingY: "6",
            transition: "default"
          },
          /* @__PURE__ */ React60.createElement(
            Box,
            {
              alignItems: "center",
              display: "flex",
              gap: "6",
              height: "24"
            },
            /* @__PURE__ */ React60.createElement(
              Box,
              {
                display: mapResponsiveValue(
                  accountStatus,
                  (value) => value === "full" || value === "avatar" ? "block" : "none"
                )
              },
              /* @__PURE__ */ React60.createElement(
                Avatar,
                {
                  address: account.address,
                  imageUrl: account.ensAvatar,
                  loading: account.hasPendingTransactions,
                  size: 24
                }
              )
            ),
            /* @__PURE__ */ React60.createElement(Box, { alignItems: "center", display: "flex", gap: "6" }, /* @__PURE__ */ React60.createElement(
              Box,
              {
                display: mapResponsiveValue(
                  accountStatus,
                  (value) => value === "full" || value === "address" ? "block" : "none"
                )
              },
              account.displayName
            ), /* @__PURE__ */ React60.createElement(DropdownIcon, null))
          )
        )
      )) : /* @__PURE__ */ React60.createElement(
        Box,
        {
          as: "button",
          background: "accentColor",
          borderRadius: "connectButton",
          boxShadow: "connectButton",
          className: touchableStyles({
            active: "shrink",
            hover: "grow"
          }),
          color: "accentColorForeground",
          fontFamily: "body",
          fontWeight: "bold",
          height: "40",
          key: "connect",
          onClick: openConnectModal,
          paddingX: "14",
          testId: "connect-button",
          transition: "default",
          type: "button"
        },
        mounted && label === "Connect Wallet" ? i18n2.t("connect_wallet.label") : label
      )
    );
  }) : /* @__PURE__ */ React60.createElement(React60.Fragment, null);
}
ConnectButton.__defaultProps = defaultProps;
ConnectButton.Custom = ConnectButtonRenderer;

// src/components/WalletButton/WalletButton.tsx
import React62, { useContext as useContext24 } from "react";

// src/components/WalletButton/WalletButton.css.ts
var border = "_1y2lnfi0";
var maxWidth = "_1y2lnfi1";

// src/components/WalletButton/WalletButtonRenderer.tsx
import React61, {
  useContext as useContext23,
  useEffect as useEffect19,
  useMemo as useMemo8,
  useState as useState16
} from "react";
import { useAccount as useAccount15, useAccountEffect as useAccountEffect4 } from "wagmi";
function WalletButtonRenderer({
  // Wallet is the same as `connector.id` which is injected into
  // wagmi connectors
  wallet = "rainbow",
  children
}) {
  const isMounted = useIsMounted();
  const { openConnectModal } = useConnectModal();
  const { connectModalOpen } = useModalState();
  const { connector, setConnector } = useContext23(WalletButtonContext);
  const [firstConnector] = useWalletConnectors().filter((wallet2) => wallet2.isRainbowKitConnector).filter((_wallet) => _wallet.id.toLowerCase() === wallet.toLowerCase()).sort((a, b) => a.groupIndex - b.groupIndex);
  if (!firstConnector) {
    throw new Error("Connector not found");
  }
  const connectionStatus = useConnectionStatus();
  const [loading, setLoading] = useState16(false);
  const [isError, setIsError] = useState16(false);
  const mobile = isMobile();
  useEffect19(() => {
    if (!connectModalOpen && connector) setConnector(null);
  }, [connectModalOpen, connector, setConnector]);
  const { isConnected, isConnecting } = useAccount15();
  useAccountEffect4({
    onConnect: () => {
      if (isError) setIsError(false);
    },
    onDisconnect: clearLatestWalletId
  });
  const isLastWalletIdConnected = useMemo8(() => {
    const lastWalletId = getLatestWalletId();
    if (!lastWalletId || !firstConnector?.id) {
      return false;
    }
    if (!isConnected) return false;
    return lastWalletId === firstConnector?.id;
  }, [isConnected, firstConnector]);
  const connectWallet = async () => {
    try {
      setLoading(true);
      if (isError) setIsError(false);
      await firstConnector?.connect?.();
    } catch {
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };
  const isStatusLoading = connectionStatus === "loading";
  const ready = !isConnecting && !!openConnectModal && firstConnector && !isStatusLoading;
  const isNotSupported = !firstConnector?.installed || !firstConnector?.ready;
  return /* @__PURE__ */ React61.createElement(React61.Fragment, null, children({
    error: isError,
    loading,
    connected: isLastWalletIdConnected,
    ready,
    mounted: isMounted(),
    connector: firstConnector,
    connect: async () => {
      addLatestWalletId(firstConnector?.id || "");
      if (mobile || isNotSupported) {
        openConnectModal?.();
        setConnector(firstConnector);
        return;
      }
      await connectWallet();
    }
  }));
}

// src/components/WalletButton/WalletButton.tsx
var WalletButton2 = ({ wallet }) => {
  return /* @__PURE__ */ React62.createElement(WalletButtonRenderer, { wallet }, ({ ready, connect, connected, mounted, connector, loading }) => {
    const isDisabled = !ready || loading;
    const { i18n: i18n2 } = useContext24(I18nContext);
    const connectorName = connector?.name || "";
    if (!mounted) return;
    return /* @__PURE__ */ React62.createElement(
      Box,
      {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        disabled: isDisabled,
        pointerEvents: isDisabled ? "none" : "all"
      },
      /* @__PURE__ */ React62.createElement(
        Box,
        {
          as: "button",
          borderRadius: "menuButton",
          borderStyle: "solid",
          borderWidth: "1",
          className: [
            maxWidth,
            border,
            touchableStyles({
              active: "shrink",
              hover: "grow"
            })
          ],
          minHeight: "44",
          onClick: connect,
          disabled: !ready || loading,
          padding: "6",
          style: { willChange: "transform" },
          testId: `wallet-button-${connector?.id || ""}`,
          transition: "default",
          width: "full",
          background: "connectButtonBackground"
        },
        /* @__PURE__ */ React62.createElement(
          Box,
          {
            color: "modalText",
            fontFamily: "body",
            fontSize: "16",
            fontWeight: "bold",
            transition: "default",
            display: "flex",
            alignItems: "center"
          },
          /* @__PURE__ */ React62.createElement(
            Box,
            {
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              gap: "12",
              paddingRight: "6"
            },
            /* @__PURE__ */ React62.createElement(Box, null, loading ? /* @__PURE__ */ React62.createElement(SpinnerIcon, null) : /* @__PURE__ */ React62.createElement(
              AsyncImage,
              {
                background: connector?.iconBackground,
                borderRadius: "6",
                height: "28",
                src: connector?.iconUrl,
                width: "28"
              }
            )),
            /* @__PURE__ */ React62.createElement(
              Box,
              {
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                color: "modalText"
              },
              /* @__PURE__ */ React62.createElement(Box, { testId: `wallet-button-label-${connector?.id || ""}` }, loading ? i18n2.t("connect.status.connecting", {
                wallet: connectorName
              }) : connectorName)
            ),
            connected ? /* @__PURE__ */ React62.createElement(
              Box,
              {
                background: "connectionIndicator",
                borderColor: "selectedOptionBorder",
                borderRadius: "full",
                borderStyle: "solid",
                borderWidth: "1",
                height: "8",
                width: "8"
              }
            ) : null
          )
        )
      )
    );
  });
};
WalletButton2.Custom = WalletButtonRenderer;

// src/config/getDefaultConfig.ts
import { http } from "wagmi";
import { createConfig } from "wagmi";

// src/wallets/computeWalletConnectMetaData.ts
var computeWalletConnectMetaData = ({
  appName,
  appDescription,
  appUrl,
  appIcon
}) => {
  return {
    name: appName,
    description: appDescription ?? appName,
    url: appUrl ?? (typeof window !== "undefined" ? window.location.origin : ""),
    icons: [...appIcon ? [appIcon] : []]
  };
};

// src/utils/omitUndefinedValues.ts
function omitUndefinedValues(obj) {
  return Object.fromEntries(
    //@ts-ignore
    Object.entries(obj).filter(([_key, value]) => value !== void 0)
  );
}

// src/utils/uniqueBy.ts
function uniqueBy(items, key) {
  const filtered = [];
  for (const item of items) {
    if (!filtered.some((x) => x[key] === item[key])) {
      filtered.push(item);
    }
  }
  return filtered;
}

// src/wallets/connectorsForWallets.ts
var connectorsForWallets = (walletList, {
  projectId,
  walletConnectParameters,
  appName,
  appDescription,
  appUrl,
  appIcon
}) => {
  if (!walletList.length) {
    throw new Error("No wallet list was provided");
  }
  for (const { wallets, groupName } of walletList) {
    if (!wallets.length) {
      throw new Error(`No wallets provided for group: ${groupName}`);
    }
  }
  let index = -1;
  const connectors = [];
  const visibleWallets = [];
  const potentiallyHiddenWallets = [];
  const walletConnectMetaData = computeWalletConnectMetaData({
    appName,
    appDescription,
    appUrl,
    appIcon
  });
  for (const [groupIndex, { groupName, wallets }] of walletList.entries()) {
    for (const createWallet of wallets) {
      index++;
      const wallet = createWallet({
        projectId,
        appName,
        appIcon,
        // `option` is being used only for `walletConnectWallet` wallet
        options: {
          metadata: walletConnectMetaData,
          ...walletConnectParameters
        },
        // Every other wallet that supports walletConnect flow and is not
        // `walletConnectWallet` wallet will have `walletConnectParameters` property
        walletConnectParameters: {
          metadata: walletConnectMetaData,
          ...walletConnectParameters
        }
      });
      if (wallet?.iconAccent && !isHexString(wallet?.iconAccent)) {
        throw new Error(
          `Property \`iconAccent\` is not a hex value for wallet: ${wallet.name}`
        );
      }
      const walletListItem = {
        ...wallet,
        groupIndex: groupIndex + 1,
        groupName,
        index
      };
      if (typeof wallet.hidden === "function") {
        potentiallyHiddenWallets.push(walletListItem);
      } else {
        visibleWallets.push(walletListItem);
      }
    }
  }
  const walletListItems = uniqueBy(
    [...visibleWallets, ...potentiallyHiddenWallets],
    "id"
  );
  for (const {
    createConnector: createConnector6,
    groupIndex,
    groupName,
    hidden,
    ...walletMeta
  } of walletListItems) {
    if (typeof hidden === "function") {
      const isHidden = hidden();
      if (isHidden) {
        continue;
      }
    }
    const walletMetaData = (additionalRkParams) => {
      return {
        rkDetails: omitUndefinedValues({
          ...walletMeta,
          groupIndex,
          groupName,
          isRainbowKitConnector: true,
          // These additional params will be used in rainbowkit react tree to
          // merge `walletConnectWallet` and `walletConnect` connector from wagmi with
          // showQrModal: true. This way we can let the user choose if they want to
          // connect via QR code or open the official walletConnect modal instead
          ...additionalRkParams ? additionalRkParams : {}
        })
      };
    };
    const isWalletConnectConnector = walletMeta.id === "walletConnect";
    if (isWalletConnectConnector) {
      connectors.push(
        createConnector6(
          walletMetaData({
            isWalletConnectModalConnector: true,
            showQrModal: true
          })
        )
      );
    }
    const connector = createConnector6(walletMetaData());
    connectors.push(connector);
  }
  return connectors;
};

// src/wallets/getWalletConnectConnector.ts
import { createConnector } from "wagmi";
import { walletConnect } from "wagmi/connectors";
var walletConnectInstances = /* @__PURE__ */ new Map();
var getOrCreateWalletConnectInstance = ({
  projectId,
  walletConnectParameters,
  rkDetailsShowQrModal,
  rkDetailsIsWalletConnectModalConnector
}) => {
  let config = {
    telemetryEnabled: false,
    // Disable analytics by default
    ...walletConnectParameters ? walletConnectParameters : {},
    projectId,
    showQrModal: false
    // Required. Otherwise WalletConnect modal (Web3Modal) will popup during time of connection for a wallet
  };
  if (rkDetailsShowQrModal) {
    config = { ...config, showQrModal: true };
  }
  if (!("customStoragePrefix" in config)) {
    config = {
      ...config,
      customStoragePrefix: rkDetailsIsWalletConnectModalConnector ? "clientOne" : "clientTwo"
    };
  }
  const serializedConfig = JSON.stringify(config);
  const sharedWalletConnector = walletConnectInstances.get(serializedConfig);
  if (sharedWalletConnector) {
    return sharedWalletConnector;
  }
  const newWalletConnectInstance = walletConnect(config);
  walletConnectInstances.set(serializedConfig, newWalletConnectInstance);
  return newWalletConnectInstance;
};
function createWalletConnectConnector({
  projectId,
  walletDetails,
  walletConnectParameters
}) {
  return createConnector((config) => ({
    ...getOrCreateWalletConnectInstance({
      projectId,
      walletConnectParameters,
      // Used in `connectorsForWallets` to add another
      // walletConnect wallet into rainbowkit with modal popup option
      rkDetailsShowQrModal: walletDetails.rkDetails.showQrModal,
      rkDetailsIsWalletConnectModalConnector: walletDetails.rkDetails.isWalletConnectModalConnector
    })(config),
    ...walletDetails
  }));
}
function getWalletConnectConnector({
  projectId,
  walletConnectParameters
}) {
  const exampleProjectId = "21fef48091f12692cad574a6f7753643";
  if (!projectId || projectId === "") {
    throw new Error(
      "No projectId found. Every dApp must now provide a WalletConnect Cloud projectId to enable WalletConnect v2 https://www.rainbowkit.com/docs/installation#configure"
    );
  }
  if (projectId === "YOUR_PROJECT_ID") {
    projectId = exampleProjectId;
  }
  return (walletDetails) => createWalletConnectConnector({
    projectId,
    walletDetails,
    walletConnectParameters
  });
}

// src/wallets/getInjectedConnector.ts
import { createConnector as createConnector2 } from "wagmi";
import { injected } from "wagmi/connectors";
function getExplicitInjectedProvider(flag) {
  const _window = typeof window !== "undefined" ? window : void 0;
  if (typeof _window === "undefined" || typeof _window.ethereum === "undefined")
    return;
  const providers = _window.ethereum.providers;
  return providers ? providers.find((provider) => provider[flag]) : _window.ethereum[flag] ? _window.ethereum : void 0;
}
function getWindowProviderNamespace(namespace) {
  const providerSearch = (provider, namespace2) => {
    const [property, ...path] = namespace2.split(".");
    const _provider = provider[property];
    if (_provider) {
      if (path.length === 0) return _provider;
      return providerSearch(_provider, path.join("."));
    }
  };
  if (typeof window !== "undefined") return providerSearch(window, namespace);
}
function hasInjectedProvider({
  flag,
  namespace
}) {
  if (namespace && typeof getWindowProviderNamespace(namespace) !== "undefined")
    return true;
  if (flag && typeof getExplicitInjectedProvider(flag) !== "undefined")
    return true;
  return false;
}
function getInjectedProvider({
  flag,
  namespace
}) {
  const _window = typeof window !== "undefined" ? window : void 0;
  if (typeof _window === "undefined") return;
  if (namespace) {
    const windowProvider = getWindowProviderNamespace(namespace);
    if (windowProvider) return windowProvider;
  }
  const providers = _window.ethereum?.providers;
  if (flag) {
    const provider = getExplicitInjectedProvider(flag);
    if (provider) return provider;
  }
  if (typeof providers !== "undefined" && providers.length > 0)
    return providers[0];
  return _window.ethereum;
}
function createInjectedConnector(provider) {
  return (walletDetails) => {
    const injectedConfig = provider ? {
      target: () => ({
        id: walletDetails.rkDetails.id,
        name: walletDetails.rkDetails.name,
        provider
      })
    } : {};
    return createConnector2((config) => ({
      // Spread the injectedConfig object, which may be empty or contain the target function
      ...injected(injectedConfig)(config),
      ...walletDetails
    }));
  };
}
function getInjectedConnector({
  flag,
  namespace,
  target
}) {
  const provider = target ? target : getInjectedProvider({ flag, namespace });
  return createInjectedConnector(provider);
}

// src/wallets/walletConnectors/baseAccount/baseAccount.ts
import { createConnector as createConnector3 } from "wagmi";
import {
  baseAccount as baseAccountConnector
} from "wagmi/connectors";
var baseAccount = ({
  appName,
  appIcon
}) => {
  const { preference, ...optionalConfig } = baseAccount;
  return {
    id: "baseAccount",
    name: "Base Account",
    shortName: "Base Account",
    rdns: "app.base.account",
    iconUrl: async () => (await import("./baseAccount-44UITRK7.js")).default,
    iconAccent: "#0000FF",
    iconBackground: "#0000FF",
    // a popup will appear prompting the user to connect or create a wallet via passkey.
    installed: true,
    createConnector: (walletDetails) => {
      const connector = baseAccountConnector({
        appName,
        appLogoUrl: appIcon,
        ...optionalConfig,
        preference: {
          telemetry: false,
          ...preference || {}
        }
      });
      return createConnector3((config) => ({
        ...connector(config),
        ...walletDetails
      }));
    }
  };
};

// src/wallets/walletConnectors/metaMaskWallet/metaMaskWallet.ts
import { createConnector as createConnector4 } from "wagmi";
import { metaMask } from "wagmi/connectors";
function isMetaMask(ethereum) {
  if (!ethereum?.isMetaMask) return false;
  if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state)
    return false;
  if (ethereum.isApexWallet) return false;
  if (ethereum.isAvalanche) return false;
  if (ethereum.isBackpack) return false;
  if (ethereum.isBifrost) return false;
  if (ethereum.isBitKeep) return false;
  if (ethereum.isBitski) return false;
  if (ethereum.isBinance) return false;
  if (ethereum.isBlockWallet) return false;
  if (ethereum.isCoinbaseWallet) return false;
  if (ethereum.isDawn) return false;
  if (ethereum.isEnkrypt) return false;
  if (ethereum.isExodus) return false;
  if (ethereum.isFrame) return false;
  if (ethereum.isFrontier) return false;
  if (ethereum.isGamestop) return false;
  if (ethereum.isHyperPay) return false;
  if (ethereum.isImToken) return false;
  if (ethereum.isKuCoinWallet) return false;
  if (ethereum.isMathWallet) return false;
  if (ethereum.isNestWallet) return false;
  if (ethereum.isOkxWallet || ethereum.isOKExWallet) return false;
  if (ethereum.isOneInchIOSWallet || ethereum.isOneInchAndroidWallet)
    return false;
  if (ethereum.isOpera) return false;
  if (ethereum.isPhantom) return false;
  if (ethereum.isZilPay) return false;
  if (ethereum.isPortal) return false;
  if (ethereum.isxPortal) return false;
  if (ethereum.isRabby) return false;
  if (ethereum.isRainbow) return false;
  if (ethereum.isStatus) return false;
  if (ethereum.isTalisman) return false;
  if (ethereum.isTally) return false;
  if (ethereum.isTokenPocket) return false;
  if (ethereum.isTokenary) return false;
  if (ethereum.isTrust || ethereum.isTrustWallet) return false;
  if (ethereum.isCTRL) return false;
  if (ethereum.isZeal) return false;
  if (ethereum.isCoin98) return false;
  if (ethereum.isMEWwallet) return false;
  if (ethereum.isSafeheron) return false;
  if (ethereum.isSafePal) return false;
  if (ethereum.isWigwam) return false;
  if (ethereum.isZerion) return false;
  if (ethereum.__seif) return false;
  return true;
}
var metaMaskWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const { ...optionalConfig } = metaMaskWallet;
  const isMetaMaskInjected = typeof window !== "undefined" ? isMetaMask(window.ethereum) : false;
  const shouldUseWalletConnect = !isMetaMaskInjected && !isMobile();
  const shouldUseMetaMaskConnector = isMetaMaskInjected || isMobile();
  return {
    id: "metaMask",
    name: "MetaMask",
    rdns: "io.metamask",
    iconUrl: async () => (await import("./metaMaskWallet-SITXT2FV.js")).default,
    iconAccent: "#f6851a",
    iconBackground: "#fff",
    installed: isMetaMaskInjected ? isMetaMaskInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=io.metamask",
      ios: "https://apps.apple.com/us/app/metamask/id1438144202",
      mobile: "https://metamask.io/download",
      qrCode: "https://metamask.io/download",
      chrome: "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn",
      edge: "https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm",
      firefox: "https://addons.mozilla.org/firefox/addon/ether-metamask",
      opera: "https://addons.opera.com/extensions/details/metamask-10",
      browserExtension: "https://metamask.io/download"
    },
    mobile: {
      // MetaMask mobile deep linking handled by wagmi, return URI unchanged.
      getUri: shouldUseMetaMaskConnector ? (uri) => uri : void 0
    },
    qrCode: shouldUseWalletConnect ? {
      getUri: (uri) => `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`,
      instructions: {
        learnMoreUrl: "https://metamask.io/faqs/",
        steps: [
          {
            description: "wallet_connectors.metamask.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.metamask.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.metamask.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.metamask.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.metamask.qr_code.step3.description",
            step: "refresh",
            title: "wallet_connectors.metamask.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    extension: {
      instructions: {
        learnMoreUrl: "https://metamask.io/faqs/",
        steps: [
          {
            description: "wallet_connectors.metamask.extension.step1.description",
            step: "install",
            title: "wallet_connectors.metamask.extension.step1.title"
          },
          {
            description: "wallet_connectors.metamask.extension.step2.description",
            step: "create",
            title: "wallet_connectors.metamask.extension.step2.title"
          },
          {
            description: "wallet_connectors.metamask.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.metamask.extension.step3.title"
          }
        ]
      }
    },
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : (
      // MetaMask connector
      (walletDetails) => {
        return createConnector4((config) => {
          const metamaskConnector = metaMask({
            dappMetadata: {
              connector: "rainbowkit",
              name: walletConnectParameters?.metadata?.name,
              iconUrl: walletConnectParameters?.metadata?.icons[0],
              url: walletConnectParameters?.metadata?.url
            },
            headless: true,
            checkInstallationImmediately: false,
            enableAnalytics: false,
            // Disable analytics by default
            ...optionalConfig
          })(config);
          return {
            ...metamaskConnector,
            ...walletDetails,
            getChainId: async () => {
              try {
                return await metamaskConnector.getChainId();
              } catch {
                return config.chains[0]?.id ?? 1;
              }
            }
          };
        });
      }
    )
  };
};

// src/wallets/walletConnectors/rainbowWallet/rainbowWallet.ts
var rainbowWallet = ({
  projectId,
  walletConnectParameters
}) => {
  const isRainbowInjected = hasInjectedProvider({ flag: "isRainbow" });
  const shouldUseWalletConnect = !isRainbowInjected;
  const getUri = (uri) => {
    return isAndroid() ? uri : isIOS() ? `rainbow://wc?uri=${encodeURIComponent(uri)}&connector=rainbowkit` : `https://rnbwapp.com/wc?uri=${encodeURIComponent(
      uri
    )}&connector=rainbowkit`;
  };
  return {
    id: "rainbow",
    name: "Rainbow",
    rdns: "me.rainbow",
    iconUrl: async () => (await import("./rainbowWallet-O26YNBMX.js")).default,
    iconBackground: "#0c2f78",
    installed: !shouldUseWalletConnect ? isRainbowInjected : void 0,
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=me.rainbow&referrer=utm_source%3Drainbowkit&utm_source=rainbowkit",
      ios: "https://apps.apple.com/app/apple-store/id1457119021?pt=119997837&ct=rainbowkit&mt=8",
      mobile: "https://rainbow.download?utm_source=rainbowkit",
      qrCode: "https://rainbow.download?utm_source=rainbowkit&utm_medium=qrcode",
      browserExtension: "https://rainbow.me/extension?utm_source=rainbowkit"
    },
    mobile: { getUri: shouldUseWalletConnect ? getUri : void 0 },
    qrCode: shouldUseWalletConnect ? {
      getUri,
      instructions: {
        learnMoreUrl: "https://learn.rainbow.me/connect-to-a-website-or-app?utm_source=rainbowkit&utm_medium=connector&utm_campaign=learnmore",
        steps: [
          {
            description: "wallet_connectors.rainbow.qr_code.step1.description",
            step: "install",
            title: "wallet_connectors.rainbow.qr_code.step1.title"
          },
          {
            description: "wallet_connectors.rainbow.qr_code.step2.description",
            step: "create",
            title: "wallet_connectors.rainbow.qr_code.step2.title"
          },
          {
            description: "wallet_connectors.rainbow.qr_code.step3.description",
            step: "scan",
            title: "wallet_connectors.rainbow.qr_code.step3.title"
          }
        ]
      }
    } : void 0,
    createConnector: shouldUseWalletConnect ? getWalletConnectConnector({
      projectId,
      walletConnectParameters
    }) : getInjectedConnector({ flag: "isRainbow" })
  };
};

// src/wallets/walletConnectors/safeWallet/safeWallet.ts
import { createConnector as createConnector5 } from "wagmi";
import { safe } from "wagmi/connectors";
var safeWallet = () => ({
  id: "safe",
  name: "Safe",
  iconAccent: "#12ff80",
  iconBackground: "#fff",
  iconUrl: async () => (await import("./safeWallet-5MNKTR5Z.js")).default,
  installed: (
    // Only allowed in iframe context
    // borrowed from wagmi safe connector
    !(typeof window === "undefined") && window?.parent !== window
  ),
  downloadUrls: {
    // We're opting not to provide a download prompt if the application is not
    // already running as a Safe App within the context of the Safe browser,
    // since it's unlikely to be a desired behavior for users.
  },
  createConnector: (walletDetails) => {
    return createConnector5((config) => ({
      ...safe()(config),
      ...walletDetails
    }));
  }
});

// src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.ts
var walletConnectWallet = ({
  projectId,
  options
}) => {
  const getUri = (uri) => uri;
  return {
    id: "walletConnect",
    name: "WalletConnect",
    installed: void 0,
    iconUrl: async () => (await import("./walletConnectWallet-YHWKVTDY.js")).default,
    iconBackground: "#3b99fc",
    qrCode: { getUri },
    createConnector: getWalletConnectConnector({
      projectId,
      walletConnectParameters: options
    })
  };
};

// src/config/getDefaultConfig.ts
var createDefaultTransports = (chains) => {
  const transportsObject = chains.reduce((acc, chain) => {
    const key = chain.id;
    acc[key] = http();
    return acc;
  }, {});
  return transportsObject;
};
var getDefaultConfig = ({
  appName,
  appDescription,
  appUrl,
  appIcon,
  wallets,
  projectId,
  walletConnectParameters,
  ...wagmiParameters
}) => {
  const { transports, chains, ...restWagmiParameters } = wagmiParameters;
  const metadata = computeWalletConnectMetaData({
    appName,
    appDescription,
    appUrl,
    appIcon
  });
  const connectors = connectorsForWallets(
    wallets || [
      {
        groupName: "Popular",
        wallets: [
          safeWallet,
          rainbowWallet,
          baseAccount,
          metaMaskWallet,
          walletConnectWallet
        ]
      }
    ],
    {
      projectId,
      appName,
      appDescription,
      appUrl,
      appIcon,
      walletConnectParameters: { metadata, ...walletConnectParameters }
    }
  );
  return createConfig({
    connectors,
    chains,
    transports: transports || createDefaultTransports(chains),
    ...restWagmiParameters
  });
};

// src/wallets/getDefaultWallets.ts
function getDefaultWallets(parameters) {
  const wallets = [
    {
      groupName: "Popular",
      wallets: [
        safeWallet,
        rainbowWallet,
        baseAccount,
        metaMaskWallet,
        walletConnectWallet
      ]
    }
  ];
  if (parameters) {
    return {
      connectors: connectorsForWallets(wallets, parameters),
      wallets
    };
  }
  return {
    wallets
  };
}

// src/transactions/useAddRecentTransaction.ts
import { useCallback as useCallback11 } from "react";
import { useAccount as useAccount16 } from "wagmi";
function useAddRecentTransaction() {
  const store = useTransactionStore();
  const { address } = useAccount16();
  const chainId = useChainId();
  return useCallback11(
    (transaction) => {
      if (!address || !chainId) {
        throw new Error("No address or chain ID found");
      }
      store.addTransaction(address, chainId, transaction);
    },
    [store, address, chainId]
  );
}

// src/__private__/index.ts
var __private__ = {
  DesktopOptions,
  dialogContent,
  dialogContentMobile,
  MobileOptions
};
export {
  ConnectButton,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
  WalletButton2 as WalletButton,
  __private__,
  connectorsForWallets,
  createAuthenticationAdapter,
  cssObjectFromTheme,
  cssStringFromTheme,
  darkTheme,
  getDefaultConfig,
  getDefaultWallets,
  getWalletConnectConnector,
  lightTheme,
  midnightTheme,
  useAccountModal,
  useAddRecentTransaction,
  useChainModal,
  useConnectModal
};
