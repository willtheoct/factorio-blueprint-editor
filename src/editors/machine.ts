import Entity from '../factorio-data/entity'
import Editor from './editor'

/** Assembly Machines Editor */
export default class MachineEditor extends Editor {
    public constructor(entity: Entity) {
        super(402, 171, entity)

        // Add Recipe
        this.addLabel(140, 56, 'Recipe:')
        this.addRecipe(208, 45)

        if (entity.moduleSlots !== 0) {
            // Add Modules
            this.addLabel(140, 94, 'Modules:')
            this.addModules(208, 83)
        }
    }
}
