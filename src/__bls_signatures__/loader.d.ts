import type {ModuleInstance} from "bls-signatures";
type TCreateModule = () => Promise<ModuleInstance>;
export default TCreateModule;
