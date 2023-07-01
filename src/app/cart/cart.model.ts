export default class CartItem {

  constructor(
    public price: number,
    public readonly title: string,
    public quantity: number,
    public image: string | null,
    public readonly id: string,
    public readonly description: string,
    public readonly guid: string,
    public readonly pId: string,
    public errorMessage: string
  ){
  }

  get productPrice(): number{
    return Number(this.price);
  }

  get productTitle(){
    return this.title;
  }

  get productQuantity(){
    return this.quantity;
  }

  set productQuantity(val: number){
    this.quantity = val;
  }

  get productDescription(){
    return this.description
  }

  get productImage(){
    return this.image;
  }

  get productID(){
    return this.id;
  }

}
