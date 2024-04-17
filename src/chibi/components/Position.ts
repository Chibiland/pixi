import TransitionableComponent from "./TransitionableComponent";
import Linear from "../math/easing/Linear";
import {Container} from "../../scene";
import {ObservablePoint, Observer, PointData} from "../../maths";
import Mixin from "../mixin/Mixin";
import EventEmitter from "eventemitter3";

interface PositionEvents {
    change: [position: PointData];
}

export default class Position extends Mixin(
    TransitionableComponent<"position", PointData, Container>,
    ["ObservablePoint", ObservablePoint] as const,
    ["EventEmitter", EventEmitter<PositionEvents>] as const
) {
    readonly componentName = "position";

    // public https://github.com/microsoft/TypeScript/issues/49709
    public target: Container;

    public constructor(x: number, y: number, private readonly observer?: Observer<ObservablePoint>) {
        super({x, y});
        this.mixin(new EventEmitter());
        this.mixin(new ObservablePoint(this, x, y));
    }

    public _onUpdate(point: ObservablePoint) {
        console.log("update", point.x, point.y, this.x, this.y);
        this.observer?._onUpdate(this);
    }

    public apply(target: Container): void {
        this.target = target;

        this.set(this.current);

        if (this.transitionMillis) {
            this.enableTransition();
        }
    }

    public static zero() {
        return new Position(0, 0);
    }

    public setPosition(position: PointData | number, y: number = 0) {
        if (typeof position === "number") {
            this.set({x: position, y});
        } else {
            this.set(position);
        }
        return this;
    }

    public get x() {
        return this.current.x;
    }

    public get y() {
        return this.current.y;
    }

    public set x(x: number) {
        this.current.x = x;
        // @ts-ignore
        this.ObservablePoint.x = x;
        this.emit("change", this);
    }

    public set y(y: number) {
        this.current.y = y;
        this.ObservablePoint.y = y;
        this.emit("change", this);
    }

    public set(x: number | PointData, y: number = 0): this {
        if (typeof x === "number") {
            super.set({x, y});
            this.ObservablePoint.set(x, y);
        } else {
            super.set({x: x.x, y: x.y});
            this.ObservablePoint.set(x.x, x.y);
        }
        return this;
    }

    public setX(x: number) {
        this.x = x;
        return this;
    }

    public setY(y: number) {
        this.y = y;
        return this;
    }

    public addX(number: number): this {
        this.set(this.x + number, this.y);
        return this;
    }

    public addY(number: number): this {
        this.set(this.x, this.y + number);
        return this;
    }

    public clone() {
        return new Position(this.x, this.y);
    }

    public plusY(dy: number): Position {
        return new Position(this.x, this.y + dy);
    }

    public plusX(dx: number): Position {
        return new Position(this.x + dx, this.y);
    }

    public interpolate(from: PointData, to: PointData, alpha: number): PointData {
        return {
            x: Linear.INSTANCE.interpolate(from.x, to.x, alpha),
            y: Linear.INSTANCE.interpolate(from.y, to.y, alpha)
        }
    }

    protected assign(value: PointData) {
        this.ObservablePoint.set(value.x, value.y);
    }
}
