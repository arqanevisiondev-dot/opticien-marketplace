"use client"

import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import ProductEditForm from "@/components/product-edit-form"
import { useLanguage } from "@/contexts/LanguageContext"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const productId = params.id as string

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  if (status === "loading" || !session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEE9DF] to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/admin/products">
          <Button variant="outline" size="sm" className="mb-6 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t.backToProducts}
          </Button>
        </Link>
        <ProductEditForm productId={productId} />
      </div>
    </div>
  )
}
