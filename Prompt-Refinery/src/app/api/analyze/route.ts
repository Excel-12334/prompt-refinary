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
 analyzePromptSchema 
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

    
const
 rateLimit 
=

await

checkRateLimit
(
`
analyze:
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
 analyzePromptSchema
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

    
const
 refiner 
=

createRefiner
(
)
;

    
const
 analysis 
=

await
 refiner
.
analyze
(
validation
.
data
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
 analysis 
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
'Analysis error:'
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

'Failed to analyze prompt'

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
