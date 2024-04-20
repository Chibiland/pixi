import type {AssetsClass} from "../../assets";

type Loadable = {
    create(assets: AssetsClass): Promise<void>
}

export default Loadable;
