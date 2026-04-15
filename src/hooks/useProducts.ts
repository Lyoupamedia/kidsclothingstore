import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (!error && data) setProducts(data);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setProduct(data);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading };
}
