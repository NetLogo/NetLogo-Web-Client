class list
  constructor: (@maxLen, @len = 0, @head = null, @tail = null, @cursor = null) ->
  append: (newNode) ->
    newNode.older = @head
    @head = newNode
    if @len < @maxLen
      @len++
    else
      oldTail = @tail
      @tail = oldTail.newer
      @tail.older = null

class node
  constructor: (@data, @newer = null, @older = null) ->
