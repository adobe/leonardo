import {hsluv as colorHsluv} from "./../index";
import color, {hue} from "./color";

function hsluv(hue) {
	return function(start, end) {
		var l = hue((start = colorHsluv(start)).l, (end = colorHsluv(end)).l),
				u = color(start.u, end.u),
				v = color(start.v, end.v),
				opacity = color(start.opacity, end.opacity);
		return function(t) {
			start.l = l(t);
			start.u = u(t);
			start.v = v(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
}

export default hsluv(hue);
export var hsluvLong = hsluv(color);
