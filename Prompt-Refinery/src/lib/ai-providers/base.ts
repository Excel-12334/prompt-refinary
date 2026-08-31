interface

AIProvider

{

  name
:

string
;

  
generateText
(
prompt
:

string
,
 config
?
:
 Partial
<
AIProviderConfig
>
)
:

Promise
<
AIResponse
>
;

  
generateChat
(
messages
:
 AIMessage
[
]
,
 config
?
:
 Partial
<
AIProviderConfig
>
)
:

Promise
<
AIResponse
>
;

}
