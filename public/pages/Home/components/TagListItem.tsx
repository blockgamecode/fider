import React from "react"
import { Tag } from "@fider/models"
import { Icon, ShowTag } from "@fider/components"
import IconCheck from "@fider/assets/images/heroicons-check.svg"

interface TagListItemProps {
  tag: Tag
  assigned: boolean
  onClick: (tag: Tag) => void
}

export const TagListItem = (props: TagListItemProps) => {
  const onClick = () => {
    props.onClick(props.tag)
  }

  return (
    <div className="clickable hover:bg-gray-100 rounded py-1 flex flex-x flex--spacing-0 mr-2" onClick={onClick}>
      <Icon sprite={IconCheck} className={`h-4 text-green-600 ${!props.assigned && "invisible"}`} />
      <ShowTag tag={props.tag} />
    </div>
  )
}
