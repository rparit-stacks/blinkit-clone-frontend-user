import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaStar, FaMinus, FaPlus, FaShoppingCart, FaBolt, FaShieldAlt, FaTruck } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import BottomNav from "@/components/customer/BottomNav";
import FloatingCartBar from "@/components/customer/FloatingCartBar";
import { catalogKeys, fetchProductById } from "@/lib/catalogApi";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, removeItem, getQuantity } = useCart();

  const { data: product, isPending } = useQuery({
    queryKey: catalogKeys.product(id ?? ""),
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl">😕</span>
          <h2 className="text-lg font-bold text-foreground mt-4">Product not found</h2>
          <Link to="/" className="text-primary text-sm mt-2 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const qty = getQuantity(product.id);
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-[#F7F3FF] border-b border-violet-100/60 px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-white/90 border border-violet-100 flex items-center justify-center text-foreground"
        >
          <FaChevronLeft className="w-3.5 h-3.5" />
        </button>
        <h1 className="text-sm font-bold text-foreground flex-1 truncate">{product.name}</h1>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-square object-cover lg:aspect-video lg:rounded-card lg:mt-4 lg:mx-4"
          />
          {product.badge && (
            <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-pill">
              {product.badge}
            </span>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{product.unit}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-success/10 px-2 py-1 rounded-pill">
                <FaStar className="w-3 h-3 text-success" />
                <span className="text-xs font-bold text-success">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">120+ ratings</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            {discount > 0 && (
              <>
                <span className="text-base text-muted-foreground line-through">₹{product.originalPrice}</span>
                <span className="text-sm font-bold text-success">{discount}% OFF</span>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-1 text-xs text-muted-foreground">
              <FaTruck className="w-3 h-3 text-primary" /> Free delivery over ₹500
            </div>
            <div className="flex-1 flex items-center gap-1 text-xs text-muted-foreground">
              <FaShieldAlt className="w-3 h-3 text-primary" /> Genuine product
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="bg-card rounded-card p-4 shadow-card">
            <p className="text-sm font-medium text-foreground mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => removeItem(product.id, qty)}
                disabled={qty === 0}
                className="w-10 h-10 flex items-center justify-center rounded-button bg-muted text-foreground disabled:opacity-30"
              >
                <FaMinus className="w-3 h-3" />
              </button>
              <span className="text-lg font-bold text-foreground min-w-[24px] text-center">{qty}</span>
              <button
                type="button"
                onClick={() => addItem(product.id, qty)}
                className="w-10 h-10 flex items-center justify-center rounded-button bg-primary text-primary-foreground"
              >
                <FaPlus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => addItem(product.id, qty)}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-button flex items-center justify-center gap-2 font-bold text-sm"
            >
              <FaShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <Link
              to="/cart"
              className="flex-1 h-12 bg-foreground text-background rounded-button flex items-center justify-center gap-2 font-bold text-sm"
            >
              <FaBolt className="w-4 h-4" /> View Cart
            </Link>
          </div>
        </div>
      </div>

      <FloatingCartBar />
      <BottomNav />
    </div>
  );
};

export default ProductDetail;
