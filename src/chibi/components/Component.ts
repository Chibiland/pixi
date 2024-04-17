import {Container} from "../../scene";

export default abstract class Component<Name extends string, in T extends Container = Container> {
    public abstract readonly componentName: Name;

    /**
     * To override.
     * Called when the component is added to a gameobject.
     * @param target
     */
    // @ts-ignore
    public setTarget(target: T): void {
        // To override
    }

    /**
     * To override.
     * Called when the gameobject is loaded and ready to apply the component.
     * @param target
     */
    // @ts-ignore
    public apply(target: T): void {
        // To override
    }

    // Alternative to contravariance that may be broken https://github.com/microsoft/TypeScript/issues/53798
    // #invariantStructuralHint = undefined as unknown as (x: T) => void
}

/*
    Component<GameObject> is assignable to Component<Sprite>
    because Sprite extends GameObject, something that is applicable to a GameObject is applicable to a Sprite
    => contravariance
*/
