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
 updatePromptSchema 
}

from

'@/lib/validators'
;

export

async

function

GET
(
req
:
 NextRequest
,

{
 params 
}
:

{
 params
:

{
 id
:

string

}

}
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
 prompt 
=

await
 prisma
.
prompt
.
findFirst
(
{

      where
:

{
 id
:
 params
.
id
,
 userId
:
 session
.
user
.
id 
}
,

      include
:

{

        category
:

true
,

        targetPlatform
:

true
,

        folder
:

true
,

        tags
:

{
 include
:

{
 tag
:

true

}

}
,

        versions
:

{
 orderBy
:

{
 versionNumber
:

'desc'

}

}
,

      
}
,

    
}
)
;

    
if

(
!
prompt
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

'Prompt not found'

}
,

{
 status
:

404

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
)
;

  
}

catch

(
error
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

'Failed to fetch prompt'

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

export

async

function

PATCH
(
req
:
 NextRequest
,

{
 params 
}
:

{
 params
:

{
 id
:

string

}

}
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
 existing 
=

await
 prisma
.
prompt
.
findFirst
(
{

      where
:

{
 id
:
 params
.
id
,
 userId
:
 session
.
user
.
id 
}
,

    
}
)
;

    
if

(
!
existing
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

'Prompt not found'

}
,

{
 status
:

404

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
 updatePromptSchema
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
 updateData
:

any

=

{
}
;

    
if

(
validation
.
data
.
title 
!==

undefined
)
 updateData
.
title 
=
 validation
.
data
.
title
;

    
if

(
validation
.
data
.
isFavourite 
!==

undefined
)
 updateData
.
isFavourite 
=
 validation
.
data
.
isFavourite
;

    
if

(
validation
.
data
.
folderId 
!==

undefined
)
 updateData
.
folderId 
=
 validation
.
data
.
folderId
;

    
const
 prompt 
=

await
 prisma
.
prompt
.
update
(
{

      where
:

{
 id
:
 params
.
id 
}
,

      data
:
 updateData
,

      include
:

{
 category
:

true
,
 targetPlatform
:

true
,
 folder
:

true
,
 tags
:

{
 include
:

{
 tag
:

true

}

}

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
)
;

  
}

catch

(
error
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

'Failed to update prompt'

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

export

async

function

DELETE
(
req
:
 NextRequest
,

{
 params 
}
:

{
 params
:

{
 id
:

string

}

}
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
 existing 
=

await
 prisma
.
prompt
.
findFirst
(
{

      where
:

{
 id
:
 params
.
id
,
 userId
:
 session
.
user
.
id 
}
,

    
}
)
;

    
if

(
!
existing
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

'Prompt not found'

}
,

{
 status
:

404

}
)
;

    
await
 prisma
.
prompt
.
update
(
{

      where
:

{
 id
:
 params
.
id 
}
,

      data
:

{
 status
:

'DELETED'

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
 message
:

'Prompt deleted successfully'

}
)
;

  
}

catch

(
error
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

'Failed to delete prompt'

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
