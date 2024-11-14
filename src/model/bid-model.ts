export default class BidModel {
    private bidValue: number = 0;

    constructor() { }

    public getBidValue(): number {
        return this.bidValue;
    }

    public setBidValue(bidValue: number): void {
        this.bidValue = bidValue;
    }
}
