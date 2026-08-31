import

{
 NextRequest
,
 NextResponse 
}

from

'next/server'
;

import

{
 getServerSession 
}

from

'next-auth'
;

import

{
 authOptions 
}

from

'@/lib/auth'
;

import

{
 prisma 
}

from

'@/lib/prisma'
;

import

{
 refinePromptSchema 
}

from

'@/lib/validators'
;

import

{
 createRefiner 
}

from

'@/lib/prompt-refiner'
;

import

{
 checkRateLimit 
}

from

'@/lib/rate-limiter'
;

import

{
 planLimits 
}

from

'@/lib/validators'
;

export

async

function

POST
(
req
:
 NextRequest
)

{

  
try

{

    
const
 session 
=

await

getServerSession
(
authOptions
)
;

    
if

(
!
session
?.
user
)

{

      
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Unauthorized'

}
,

{
 status
:

401

}
)
;

    
}

    
// Rate limiting

    
const
 rateLimit 
=

await

checkRateLimit
(
`
refine:
${
session
.
user
.
id
}
`
,

'refinement'
)
;

    
if

(
!
rateLimit
.
allowed
)

{

      
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Rate limit exceeded. Please slow down.'

}
,

{
 status
:

429

}
)
;

    
}

    
// Check usage limits

    
const
 user 
=

await
 prisma
.
user
.
findUnique
(
{

      where
:

{
 id
:
 session
.
user
.
id 
}
,

      select
:

{
 subscriptionPlan
:

true
,
 monthlyPromptCount
:

true
,
 monthlyPromptReset
:

true

}
,

    
}
)
;

    
const
 limits 
=
 planLimits
[
user
?.
subscriptionPlan 
||

'FREE'
]
;

    
const
 now 
=

new

Date
(
)
;

    
if

(
!
user
?.
monthlyPromptReset 
||

new

Date
(
user
.
monthlyPromptReset
)
.
getMonth
(
)

!==
 now
.
getMonth
(
)
)

{

      
await
 prisma
.
user
.
update
(
{

        where
:

{
 id
:
 session
.
user
.
id 
}
,

        data
:

{
 monthlyPromptCount
:

0
,
 monthlyPromptReset
:
 now 
}
,

      
}
)
;

    
}

else

if

(
(
user
.
monthlyPromptCount 
||

0
)

>=
 limits
.
monthlyPromptLimit
)

{

      
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Monthly refinement limit reached. Upgrade your plan.'

}
,

{
 status
:

403

}
)
;

    
}

    
const
 body 
=

await
 req
.
json
(
)
;

    
const
 validation 
=
 refinePromptSchema
.
safeParse
(
body
)
;

    
if

(
!
validation
.
success
)

{

      
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:
 validation
.
error
.
errors
[
0
]
.
message 
}
,

{
 status
:

400

}
)
;

    
}

    
const
 input 
=
 validation
.
data
;

    
// Determine provider based on plan

    
let
 providerName 
=
 process
.
env
.
DEFAULT_AI_PROVIDER

||

'openai'
;

    
if

(
user
?.
subscriptionPlan 
===

'FREE'

&&
 providerName 
!==

'openai'
)

{

      providerName 
=

'openai'
;

// Free plan limited to OpenAI

    
}

    
const
 refiner 
=

createRefiner
(
providerName
)
;

    
const
 result 
=

await
 refiner
.
refine
(
input
)
;

    
// Increment usage

    
await
 prisma
.
user
.
update
(
{

      where
:

{
 id
:
 session
.
user
.
id 
}
,

      data
:

{
 monthlyPromptCount
:

{
 increment
:

1

}
,
 totalPromptCount
:

{
 increment
:

1

}

}
,

    
}
)
;

    
// Log usage

    
await
 prisma
.
usageRecord
.
create
(
{

      data
:

{

        userId
:
 session
.
user
.
id
,

        aiProvider
:
 result
.
aiProvider
,

        aiModel
:
 result
.
aiModel
,

        promptCategory
:
 input
.
categoryId
,

        inputTokens
:
 result
.
tokenCount 
?
 Math
.
floor
(
result
.
tokenCount 
*

0.3
)

:

undefined
,

        outputTokens
:
 result
.
tokenCount 
?
 Math
.
floor
(
result
.
tokenCount 
*

0.7
)

:

undefined
,

        totalTokens
:
 result
.
tokenCount
,

        estimatedCost
:
 result
.
tokenCount 
?

(
result
.
tokenCount 
/

1000
)

*

0.002

:

undefined
,

        status
:

'SUCCESS'
,

      
}
,

    
}
)
;

    
return
 NextResponse
.
json
(
{
 success
:

true
,
 data
:
 result 
}
)
;

  
}

catch

(
error
)

{

    
console
.
error
(
'Refinement error:'
,
 error
)
;

    
return
 NextResponse
.
json
(
{
 success
:

false
,
 error
:

'Failed to refine prompt'

}
,

{
 status
:

500

}
)
;

  
}

}
