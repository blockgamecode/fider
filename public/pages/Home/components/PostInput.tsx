import React, { useState, useEffect, useRef } from "react"
import { Button, ButtonClickEvent, Input, Form, TextArea, MultiImageUploader } from "@fider/components"
import { SignInModal } from "@fider/components"
import { cache, actions, Failure } from "@fider/services"
import { ImageUpload, Tag } from "@fider/models"
import { useFider } from "@fider/hooks"
import { t } from "@lingui/macro"
import { HStack } from "@fider/components/layout"
import { TagListItem } from "./TagListItem"

interface PostInputProps {
  placeholder: string
  tags: Tag[]
  onTitleChanged: (title: string) => void
}

const CACHE_TITLE_KEY = "PostInput-Title"
const CACHE_DESCRIPTION_KEY = "PostInput-Description"

export const PostInput = (props: PostInputProps) => {
  const getCachedValue = (key: string): string => {
    if (fider.session.isAuthenticated) {
      return cache.session.get(key) || ""
    }
    return ""
  }

  const fider = useFider()
  const titleRef = useRef<HTMLInputElement>()
  const [title, setTitle] = useState(getCachedValue(CACHE_TITLE_KEY))
  const [description, setDescription] = useState(getCachedValue(CACHE_DESCRIPTION_KEY))
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [attachments, setAttachments] = useState<ImageUpload[]>([])
  const [chosenTags, setChosenTags] = useState<Tag[]>([])
  const [error, setError] = useState<Failure | undefined>(undefined)

  useEffect(() => {
    props.onTitleChanged(title)
  }, [title])

  const handleTitleFocus = () => {
    if (!fider.session.isAuthenticated && titleRef.current) {
      titleRef.current.blur()
      setIsSignInModalOpen(true)
    }
  }

  const handleTitleChange = (value: string) => {
    cache.session.set(CACHE_TITLE_KEY, value)
    setTitle(value)
    props.onTitleChanged(value)
  }

  const hideModal = () => setIsSignInModalOpen(false)
  const clearError = () => setError(undefined)

  const handleDescriptionChange = (value: string) => {
    cache.session.set(CACHE_DESCRIPTION_KEY, value)
    setDescription(value)
  }

  const toggleTag = async (tag: Tag) => {
    const idx = chosenTags.indexOf(tag)

    if (idx >= 0) {
      let newTags = [...chosenTags]
      newTags.splice(idx, 1)
      setChosenTags(newTags)
    } else {
      setChosenTags([...chosenTags, tag])
    }
  }

  const submit = async (event: ButtonClickEvent) => {
    if (title) {
      const tags = chosenTags.map(tag => tag.slug)
      const result = await actions.createPost(title, description, attachments, tags)
      if (result.ok) {
        clearError()
        cache.session.remove(CACHE_TITLE_KEY, CACHE_DESCRIPTION_KEY)
        location.href = `/posts/${result.data.number}/${result.data.slug}`
        event.preventEnable()
      } else if (result.error) {
        setError(result.error)
      }
    }
  }

  const details = () => (
    <>
      <TextArea
        field="description"
        onChange={handleDescriptionChange}
        value={description}
        minRows={5}
        placeholder={t({ id: "home.postinput.description.placeholder", message: "Describe your suggestion (optional)" })}
      />
      <MultiImageUploader field="attachments" maxUploads={3} onChange={setAttachments} />

      <div className="mb-2">
        <span className="text-category">Select all that apply</span>
        <HStack className="flex-wrap">
          {props.tags.map((tag) => (
            <TagListItem key={tag.id} tag={tag} assigned={chosenTags.indexOf(tag) >= 0} onClick={toggleTag} />
          ))}
        </HStack>
      </div>

      <Button type="submit" variant="primary" onClick={submit}>
        Submit
      </Button>
    </>
  )

  return (
    <>
      <SignInModal isOpen={isSignInModalOpen} onClose={hideModal} />
      <Form error={error}>
        <Input
          field="title"
          disabled={fider.isReadOnly}
          noTabFocus={!fider.session.isAuthenticated}
          inputRef={titleRef}
          onFocus={handleTitleFocus}
          maxLength={100}
          value={title}
          onChange={handleTitleChange}
          placeholder={props.placeholder}
        />
        {title && details()}
      </Form>
    </>
  )
}
