import {RGBCubeVisualization} from "./RGBCubeVisualization";
import {HSVVisualization} from "./HSVVisualization";
import {HSLVisualization} from "./HSLVisualization";
import {CMYCubeVisualization} from "./CMYCubeVisualization";


export const CSS_VISUALIZATION_CLASSES = ["rgb-cube", "hsv", "hsl", "cmy-cube"];

export function make_visualization_by_css_class(css_class, $container, options) {
    switch(css_class) {
        case "rgb-cube": return new RGBCubeVisualization($container, options);
        case "hsv": return new HSVVisualization($container, options);
        case "hsl": return new HSLVisualization($container, options);
        case "cmy-cube": return new CMYCubeVisualization($container, options);
        default: return null;
    }
}
