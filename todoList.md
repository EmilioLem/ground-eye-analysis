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
- *chroma-js* looks promising!!! 

- Calibration "subjects"
    - White/Black brightness (before anything else? The most common shift?)
    - HSL, HSV and RGB *popular* colors
- Try using a few, a couple more, and a lot of calibration points (our AI friends can help :)
Maybe... a demo for different cases??? 
- Color Correction Matrices (CCMs) are... to complex to calibrate, and not very performant :/
- Good lightning (not necesarely consistent) and colorful background is crucial to avoid self-comensation artifacts!!!
- Ask to many people if the url is too... strange, and then ask the what would they think about a *bit.ly* shorted version.
- Divide whole code into small useful files

### Actual functions to describe color correction (as a lookup table)

- Linear interpolation (ax+b)
- Polinomial interpolation ( $\sum a_n x_n$ con $n=$ #puntos)
- Polinomial regression ( $\sum a_n x_n$ con $n<<$ #puntos) 
- Spline interpolation? 
- 

### Techniques to take quality color samples:

Hopefully, each point (either reference or reading) can use a couple hundred pixels (10x10px area min)

- Simple Average
- Median? (the most middle color)
- The most popular one
- An average of some of the most popular
- An average of the most middle colors
- 

(To define that, make a cool graph for each color reference first)

## Real ToDo list:

* ~~Add "white-black-ish dashed squares printer function, to delimit reading zones~~
* Read and start making the reading cleaner options...
    * Average
    * Median
    * etc
* Show those color on some huge filled boxes.
* Another selector, for color calibration
    * Plot the resulting line/interpolation graphic
    * Show next to readed colors, the "resulting colors
    * Finally... add some input/selector boxes with "desired color calibration tones" and 
    show them next to the resulting colors.

* Now it's time to show it to the world (see their struggles)
    * Potentially add animations, sound... we will see. 
