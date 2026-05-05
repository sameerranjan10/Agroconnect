"""
AgroConnect - Product Routes
POST   /products        →  create product (farmer)
GET    /products        →  list all with optional filters
GET    /products/{id}   →  single product detail
PUT    /products/{id}   →  update (owner only)
DELETE /products/{id}   →  delete (owner only)
GET    /products/my     →  farmer's own products
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate, ProductListResponse
from app.utils.dependencies import get_current_user, require_farmer

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    farmer: User = Depends(require_farmer),
):
    """Create a new product listing. Farmers only."""
    product = Product(**payload.model_dump(), farmer_id=farmer.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    # Eagerly load farmer for response
    return db.query(Product).options(joinedload(Product.farmer))\
             .filter(Product.id == product.id).first()


@router.get("", response_model=ProductListResponse)
def list_products(
    db:       Session = Depends(get_db),
    category: Optional[str]  = Query(None),
    location: Optional[str]  = Query(None),
    min_price:Optional[float]= Query(None),
    max_price:Optional[float]= Query(None),
    search:   Optional[str]  = Query(None),
    skip:     int = Query(0,  ge=0),
    limit:    int = Query(20, ge=1, le=100),
):
    """List all available products with optional filters."""
    q = db.query(Product).options(joinedload(Product.farmer))\
         .filter(Product.is_available == True)

    if category:
        q = q.filter(Product.category.ilike(f"%{category}%"))
    if location:
        q = q.filter(Product.location.ilike(f"%{location}%"))
    if min_price is not None:
        q = q.filter(Product.price >= min_price)
    if max_price is not None:
        q = q.filter(Product.price <= max_price)
    if search:
        q = q.filter(Product.title.ilike(f"%{search}%"))

    total = q.count()
    products = q.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return ProductListResponse(total=total, products=products)


@router.get("/my", response_model=ProductListResponse)
def my_products(
    db: Session = Depends(get_db),
    farmer: User = Depends(require_farmer),
    skip:  int = Query(0,  ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """Return all products listed by the authenticated farmer."""
    q = db.query(Product).options(joinedload(Product.farmer))\
         .filter(Product.farmer_id == farmer.id)
    total = q.count()
    products = q.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return ProductListResponse(total=total, products=products)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID."""
    product = db.query(Product).options(joinedload(Product.farmer))\
                .filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload:    ProductUpdate,
    db:         Session = Depends(get_db),
    farmer:     User   = Depends(require_farmer),
):
    """Update a product. Only the owning farmer can update."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.farmer_id != farmer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not your product")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return db.query(Product).options(joinedload(Product.farmer))\
             .filter(Product.id == product.id).first()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db:    Session = Depends(get_db),
    farmer: User  = Depends(require_farmer),
):
    """Delete a product listing. Only the owning farmer can delete."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    if product.farmer_id != farmer.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Not your product")
    db.delete(product)
    db.commit()
