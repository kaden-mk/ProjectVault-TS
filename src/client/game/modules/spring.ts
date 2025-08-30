export class Spring {
    private stiffness;
    private damping;
    private mass;

    position = Vector3.zero;
    velocity = Vector3.zero;
    target = Vector3.zero;

    constructor(stiffness?: number, damping?: number, mass?: number) {
        this.stiffness = stiffness ? stiffness : 200;
        this.damping = damping ? damping : 25;
        this.mass = mass ? mass : 1;
    }

    Shove(force: Vector3) {
        this.velocity = this.velocity.add(force);
    }

    Update(dt: number) {
        const stretch = this.position.sub(this.target);
        const force = stretch.mul(-this.stiffness).sub(this.velocity.mul(this.damping));
        const acceleration = force.div(this.mass);

        this.velocity = this.velocity.add(acceleration.mul(dt));
        this.position = this.position.add(this.velocity.mul(dt));

        return this.position;
    }

    Reset() {
        this.position = Vector3.zero;
        this.velocity = Vector3.zero;
    }
}