"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  userId: string
  userName?: string
  existingReview?: {
    id: string
    rating: number
    comment: string
  } | null
  onReviewSubmitted: () => void
}

export function ReviewForm({ userId, userName, existingReview, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      if (existingReview) {
        await supabase
          .from("app_reviews")
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id)
      } else {
        await supabase.from("app_reviews").insert({
          user_id: userId,
          rating,
          comment,
          user_name: userName || "Anonymous Farmer",
        })
      }
      onReviewSubmitted()
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">{existingReview ? "Update Your Review" : "Rate This App"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition-colors",
                  (hoveredRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
          </span>
        </div>

        <Textarea
          placeholder="Share your experience with FarmPulse... (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="bg-background/50"
        />

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full shadow-lg shadow-primary/25"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Review"}
        </Button>
      </CardContent>
    </Card>
  )
}
