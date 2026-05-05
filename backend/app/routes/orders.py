"""
AgroConnect - Order Routes
POST /orders              → place order (buyer)
GET  /orders/buyer        → buyer's orders
GET  /orders/farmer       → farmer's received orders
GET  /orders/{id}         → single order
PUT  /orders/{id}/status  → update status (farmer)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderOut, OrderStatusUpdate, OrderListResponse
from app.utils.dependencies import get_current_user, require_buyer, require_farmer

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: OrderCreate,
    db:      Session = Depends(get_db),
    buyer:   User    = Depends(require_buyer),
):
    """Place an order for a product. Buyers only."""
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product or not product.is_available:
        raise HTTPException(status_code=404, detail="Product not found or unavailable")

    if payload.quantity > product.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.quantity} {product.unit} available",
        )

    order = Order(
        buyer_id=buyer.id,
        product_id=product.id,
        quantity=payload.quantity,
        total_price=round(payload.quantity * product.price, 2),
        notes=payload.notes,
    )
    # Reduce stock
    product.quantity -= payload.quantity
    if product.quantity == 0:
        product.is_available = False

    db.add(order)
    db.commit()
    db.refresh(order)

    return db.query(Order)\
             .options(joinedload(Order.product).joinedload(Product.farmer),
                      joinedload(Order.buyer))\
             .filter(Order.id == order.id).first()


@router.get("/buyer", response_model=OrderListResponse)
def buyer_orders(db: Session = Depends(get_db), buyer: User = Depends(require_buyer)):
    """Return all orders placed by the authenticated buyer."""
    orders = db.query(Order)\
               .options(joinedload(Order.product).joinedload(Product.farmer),
                        joinedload(Order.buyer))\
               .filter(Order.buyer_id == buyer.id)\
               .order_by(Order.created_at.desc()).all()
    return OrderListResponse(total=len(orders), orders=orders)


@router.get("/farmer", response_model=OrderListResponse)
def farmer_orders(db: Session = Depends(get_db), farmer: User = Depends(require_farmer)):
    """Return all orders received for the farmer's products."""
    orders = db.query(Order)\
               .join(Product, Order.product_id == Product.id)\
               .options(joinedload(Order.product).joinedload(Product.farmer),
                        joinedload(Order.buyer))\
               .filter(Product.farmer_id == farmer.id)\
               .order_by(Order.created_at.desc()).all()
    return OrderListResponse(total=len(orders), orders=orders)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single order (must be buyer or owning farmer)."""
    order = db.query(Order)\
              .options(joinedload(Order.product).joinedload(Product.farmer),
                       joinedload(Order.buyer))\
              .filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Authorization: buyer or the farmer of the product
    is_buyer  = order.buyer_id == current_user.id
    is_farmer = order.product.farmer_id == current_user.id
    if not (is_buyer or is_farmer):
        raise HTTPException(status_code=403, detail="Access denied")

    return order


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload:  OrderStatusUpdate,
    db:       Session = Depends(get_db),
    farmer:   User    = Depends(require_farmer),
):
    """Update order status. Only the selling farmer can update."""
    order = db.query(Order)\
              .options(joinedload(Order.product),
                       joinedload(Order.buyer))\
              .filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.product.farmer_id != farmer.id:
        raise HTTPException(status_code=403, detail="Not your order")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
