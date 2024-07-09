# This is the toDo list!!! duh!

1. Remember all the ideas, and place them below
2. .. we'll figure it out

## Main problem:
> The're are multiple types of cameras among devices, which by themselves might not have a consistent output of color values, but rather a combination of the **surface of the object (texture, color, reflexion), lightning and physical obstructions like dust or fingerprints**, not to mention the built in color correction filters.
>
> The image sensor that phones have nowadays is way more powerful than the mid-range color sensors on the market, but a calibration program is needed, [end of the text].

---
---

## Ideas:
- try **new OffscreenCanvas(x,y)** instead of *document.createElement('canvas')* 
- Test a lookup table, built with a couple of color-references samples.
- Modify color on multiple spaces (hsl, hsv... rgb is boring :)
   *chroma-js* looks promising!!! 
- Use **polinomail interpolation** to map the unknow colors, matching the reference ones.
- Calibration "subjects"
    - White/Black brightness (before anything else? The most common shift?)
    - HSL... 
- Try using a few, a couple more, and a lot of calibration points (our AI friends can help :)
Maybe... a demo for different cases??? 
- Color Correction Matrices (CCMs) are... to complex to calibrate, and not very performant :/
- Good lightning (not necesarely consistent) and colorful background is crucial to avoid self-comensation artifacts!!!
- Ask to many people if the url is too... strange, and then ask the what would they think about a *bit.ly* shorted version.
- Divide whole code into small useful files