import G from '../../common/globals'
import { EntityContainer } from '../../containers/entity'
import { OverlayContainer } from '../../containers/overlay'
import Entity from '../../factorio-data/entity'
import util from '../../common/util'

/** Preview of Entity */
export default class Preview extends PIXI.Container {

    /** Blueprint Editor Entity reference */
    private readonly m_Entity: Entity

    /** Field to store size for later usage */
    private readonly m_Size: number

    /** Container to host preview */
    private m_Preview: PIXI.Container

    constructor(entity: Entity, size: number) {
        super()

        this.m_Entity = entity
        this.m_Size = size

        // Background of entity preview
        const background = new PIXI.Graphics()
            .beginFill(G.colors.editor.sprite.background.color, G.colors.editor.sprite.background.alpha)
            .drawRect(0, 0, size, size)
            .endFill()
        this.addChild(background)

        // Mask for the entity parts
        const mask = new PIXI.Graphics()
            .beginFill(0xFFFFFF)
            .drawRect(0, 0, size, size)
            .endFill()
        this.addChild(mask)
        this.mask = mask

        // Create preview
        this.m_Preview = this.generatePreview()
    }

    /** Redraw the preview */
    public redraw() {
        this.m_Preview.destroy()
        this.m_Preview = this.generatePreview()
    }

    /** Create the perview */
    private generatePreview(): PIXI.Container {
        // Add all entity parts to a separate container
        const entityParts: PIXI.Container = new PIXI.Container()
        EntityContainer.getParts(this.m_Entity, G.hr, true).forEach(s => entityParts.addChild(s))
        this.addChild(entityParts)

        const actualSpriteSize = { x: this.m_Entity.size.x, y: this.m_Entity.size.y }
        const offset = { x: 0, y: 0 }

        if (this.m_Entity.entityData.drawing_box) {
            assignDataFromDrawingBox(this.m_Entity.entityData.drawing_box)
        }

        if (this.m_Entity.entityData.drawing_boxes) {
            assignDataFromDrawingBox(this.m_Entity.entityData.drawing_boxes[util.intToDir(this.m_Entity.direction)])
        }

        function assignDataFromDrawingBox(db: number[][]) {
            actualSpriteSize.x = Math.abs(db[0][0]) + db[1][0]
            actualSpriteSize.y = Math.abs(db[0][1]) + db[1][1]
            offset.x = actualSpriteSize.x / 2 - db[1][0]
            offset.y = actualSpriteSize.y / 2 - db[1][1]
        }

        const SCALE = (this.m_Size / (Math.max(actualSpriteSize.x, actualSpriteSize.y, 3) * 32 + 32))
        entityParts.scale.set(SCALE)
        entityParts.position.set(this.m_Size / 2 + offset.x * 32 * SCALE, this.m_Size / 2 + offset.y * 32 * SCALE)

        const oc: OverlayContainer = new OverlayContainer()
        const o: PIXI.Container = oc.createEntityInfo(this.m_Entity.entity_number, { x: 0, y: 0})
        if (o !== undefined) {
            entityParts.addChild(o)
        }

        return entityParts
    }
}