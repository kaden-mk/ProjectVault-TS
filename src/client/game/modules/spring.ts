export class Spring {
    private Stiffness: number;
    private Damping: number;
    private Mass: number;

    position = Vector3.zero;
    velocity = Vector3.zero;
    target = Vector3.zero;

    constructor(stiffness?: number, damping?: number, mass?: number) {
        this.Stiffness = stiffness ? stiffness : 200;
        this.Damping = damping ? damping : 25;
        this.Mass = mass ? mass : 1;
    }

    Shove(force: Vector3) {
        this.velocity = this.velocity.add(force);
    }

    Update(dt: number) {
        if (dt <= 0) return this.position;

        const k = this.Stiffness;
        const c = this.Damping;
        const m = this.Mass;

        const omega = math.sqrt(k / m);
        const zeta = c / (2 * math.sqrt(k * m));

        const f = 1 + 2 * dt * zeta * omega;
        const dtOmega2 = dt * omega * omega;
        const dt2Omega2 = dt * dtOmega2;
        const inv = 1 / (f + dt2Omega2);

        const p = this.position;
        const v = this.velocity;
        const t = this.target;

        const newPos = p.mul(f).add(v.mul(dt)).add(t.mul(dt2Omega2)).mul(inv);
        const newVel = v.add(t.sub(p).mul(dtOmega2)).mul(inv);

        this.position = newPos;
        this.velocity = newVel;

        return this.position;
    }

    Reset() {
        this.position = Vector3.zero;
        this.velocity = Vector3.zero;
    }
}