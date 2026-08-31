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
 createPromptSchema
,
 promptQuerySchema 
}

from

'@/lib/validators'
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
 isAdmin 
}

from

'@/lib/utils'
;

import

{
 Role 
}

from

'@prisma/client'
;

// GET /api/prompts - List user's prompts

export

async

function

GET
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

    
const

{
 searchParams 
}

=

new

URL
(
req
.
url
)
;

    
const
 query 
=
 promptQuerySchema
.
parse
(
Object
.
fromEntries
(
searchParams
)
)
;

    
const
 where
:

any

=

{
 userId
:
 session
.
user
.
id
,
 status
:

'ACTIVE'

}
;

    

if

(
query
.
search
)

{

      where
.
OR

=

[

        
{
 title
:

{
 contains
:
 query
.
search
,
 mode
:

'insensitive'

}

}
,

        
{
 originalInput
:

{
 contains
:
 query
.
search
,
 mode
:

'insensitive'

}

}
,

        
{
 refinedPrompt
:

{
 contains
:
 query
.
search
,
 mode
:

'insensitive'

}

}
,

      
]
;

    
}

    
if

(
query
.
categoryId
)
 where
.
categoryId 
=
 query
.
categoryId
;

    
if

(
query
.
platformId
)
 where
.
targetPlatformId 
=
 query
.
platformId
;

    
if

(
query
.
folderId
)
 where
.
folderId 
=
 query
.
folderId
;

    
if

(
query
.
isFavourite 
!==

undefined
)
 where
.
isFavourite 
=
 query
.
isFavourite
;

    
const

[
prompts
,
 total
]

=

await

Promise
.
all
(
[

      prisma
.
prompt
.
findMany
(
{

        where
,

        include
:

{

          category
:

{
 select
:

{
 id
:

true
,
 name
:

true
,
 slug
:

true

}

}
,

          targetPlatform
:

{
 select
:

{
 id
:

true
,
 name
:

true
,
 slug
:

true

}

}
,

          folder
:

{
 select
:

{
 id
:

true
,
 name
:

true
,
 color
:

true

}

}
,

          tags
:

{
 include
:

{
 tag
:

{
 select
:

{
 id
:

true
,
 name
:

true
,
 color
:

true

}

}

}

}
,

          _count
:

{
 select
:

{
 versions
:

true

}

}
,

        
}
,

        orderBy
:

{

[
query
.
sortBy
]
:
 query
.
sortOrder 
}
,

        skip
:

(
query
.
page 
-

1
)

*
 query
.
limit
,

        take
:
 query
.
limit
,

      
}
)
,

      prisma
.
prompt
.
count
(
{
 where 
}
)
,

    
]
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
 prompts
,

      meta
:

{

        page
:
 query
.
page
,

        limit
:
 query
.
limit
,

        total
,

        totalPages
:
 Math
.
ceil
(
total 
/
 query
.
limit
)
,

      
}
,

    
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
'List prompts error:'
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

'Failed to fetch prompts'

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

// POST /api/prompts - Create a new prompt

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
prompts:create:
${
session
.
user
.
id
}
`
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

'Rate limit exceeded'

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
 planLimits 
=

{

      
FREE
:

50
,

PRO
:

500
,

BUSINESS
:

5000
,

ENTERPRISE
:

50000
,

    
}
;

    
const
 limit 
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

    
// Reset monthly count if needed

    
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
 limit
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

'Monthly prompt limit reached. Upgrade your plan.'

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
 createPromptSchema
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
 data 
=
 validation
.
data
;

    
const
 prompt 
=

await
 prisma
.
prompt
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

        title
:
 data
.
title
,

        originalInput
:
 data
.
originalInput
,

        refinedPrompt
:
 data
.
refinedPrompt
,

        categoryId
:
 data
.
categoryId
,

        targetPlatformId
:
 data
.
targetPlatformId
,

        detailLevel
:
 data
.
detailLevel
,

        qualityScore
:
 data
.
qualityScore
,

        folderId
:
 data
.
folderId
,

        aiProvider
:
 data
.
aiProvider
,

        aiModel
:
 data
.
aiModel
,

        tokenCount
:
 data
.
tokenCount
,

      
}
,

      include
:

{

        category
:

{
 select
:

{
 id
:

true
,
 name
:

true

}

}
,

        targetPlatform
:

{
 select
:

{
 id
:

true
,
 name
:

true

}

}
,

        folder
:

{
 select
:

{
 id
:

true
,
 name
:

true

}

}
,

      
}
,

    
}
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

    
// Create initial version

    
await
 prisma
.
promptVersion
.
create
(
{

      data
:

{

        promptId
:
 prompt
.
id
,

        versionNumber
:

1
,

        title
:
 data
.
title
,

        content
:
 data
.
refinedPrompt
,

        changes
:

'Initial version'
,

        qualityScore
:
 data
.
qualityScore
,

        aiProvider
:
 data
.
aiProvider
,

        aiModel
:
 data
.
aiModel
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
 prompt 
}
,

{
 status
:

201

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
'Create prompt error:'
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

'Failed to create prompt'

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
