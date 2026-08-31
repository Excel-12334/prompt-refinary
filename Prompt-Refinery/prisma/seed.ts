import

{
 PrismaClient
,
 Role
,
 AccountStatus 
}

from

'@prisma/client'
;

import
 bcrypt 
from

'bcryptjs'
;

import
 slugify 
from

'slugify'
;

const
 prisma 
=

new

PrismaClient
(
)
;

async

function

main
(
)

{

  
console
.
log
(
'Starting database seed...'
)
;

  
// Seed Categories

  
const
 categories 
=

[

    
{
 name
:

'Website'
,
 description
:

'Website design, development, and content prompts'

}
,

    
{
 name
:

'Web App'
,
 description
:

'Web application development prompts'

}
,

    
{
 name
:

'UI/UX'
,
 description
:

'User interface and experience design prompts'

}
,

    
{
 name
:

'Image'
,
 description
:

'Image generation and editing prompts'

}
,

    
{
 name
:

'Photo'
,
 description
:

'Photography-related prompts'

}
,

    
{
 name
:

'Video'
,
 description
:

'Video generation and editing prompts'

}
,

    
{
 name
:

'Graphic Design'
,
 description
:

'Graphic design and visual communication prompts'

}
,

    
{
 name
:

'Logo'
,
 description
:

'Logo design prompts'

}
,

    
{
 name
:

'3D'
,
 description
:

'3D modeling and rendering prompts'

}
,

    
{
 name
:

'Product Design'
,
 description
:

'Physical product design prompts'

}
,

    
{
 name
:

'Architecture'
,
 description
:

'Architectural design prompts'

}
,

    
{
 name
:

'CAD'
,
 description
:

'Computer-aided design prompts'

}
,

    
{
 name
:

'Mechanical Engineering'
,
 description
:

'Mechanical engineering design prompts'

}
,

    
{
 name
:

'Automotive'
,
 description
:

'Automotive design and engineering prompts'

}
,

    
{
 name
:

'Coding'
,
 description
:

'Code generation and programming prompts'

}
,

    
{
 name
:

'Software Development'
,
 description
:

'Software architecture and development prompts'

}
,

    
{
 name
:

'Marketing'
,
 description
:

'Marketing strategy and content prompts'

}
,

    
{
 name
:

'Business'
,
 description
:

'Business strategy and operations prompts'

}
,

    
{
 name
:

'Research'
,
 description
:

'Research and analysis prompts'

}
,

    
{
 name
:

'Automation'
,
 description
:

'Workflow and process automation prompts'

}
,

    
{
 name
:

'Robotics'
,
 description
:

'Robotics and automation engineering prompts'

}
,

    
{
 name
:

'Presentation'
,
 description
:

'Presentation and slide deck prompts'

}
,

    
{
 name
:

'Document'
,
 description
:

'Document creation and writing prompts'

}
,

    
{
 name
:

'Data Analysis'
,
 description
:

'Data analysis and visualization prompts'

}
,

    
{
 name
:

'Other'
,
 description
:

'General purpose prompts'

}
,

  
]
;

  
for

(
const
 cat 
of
 categories
)

{

    
await
 prisma
.
promptCategory
.
upsert
(
{

      where
:

{
 slug
:

slugify
(
cat
.
name
,

{
 lower
:

true

}
)

}
,

      update
:

{
}
,

      create
:

{

        name
:
 cat
.
name
,

        slug
:

slugify
(
cat
.
name
,

{
 lower
:

true

}
)
,

        description
:
 cat
.
description
,

        active
:

true
,

      
}
,

    
}
)
;

  
}

  
console
.
log
(
'Categories seeded'
)
;

  
// Seed AI Platforms

  
const
 platforms 
=

[

    
{
 name
:

'ChatGPT'
,
 description
:

'OpenAI ChatGPT optimization'

}
,

    
{
 name
:

'Claude'
,
 description
:

'Anthropic Claude optimization'

}
,

    
{
 name
:

'Gemini'
,
 description
:

'Google Gemini optimization'

}
,

    
{
 name
:

'Grok'
,
 description
:

'xAI Grok optimization'

}
,

    
{
 name
:

'DeepSeek'
,
 description
:

'DeepSeek optimization'

}
,

    
{
 name
:

'Cursor'
,
 description
:

'Cursor IDE optimization'

}
,

    
{
 name
:

'GitHub Copilot'
,
 description
:

'GitHub Copilot optimization'

}
,

    
{
 name
:

'Lovable'
,
 description
:

'Lovable.dev optimization'

}
,

    
{
 name
:

'Bolt'
,
 description
:

'Bolt.new optimization'

}
,

    
{
 name
:

'Replit'
,
 description
:

'Replit optimization'

}
,

    
{
 name
:

'Midjourney'
,
 description
:

'Midjourney image generation optimization'

}
,

    
{
 name
:

'Stable Diffusion'
,
 description
:

'Stable Diffusion optimization'

}
,

    
{
 name
:

'Flux'
,
 description
:

'Flux image generation optimization'

}
,

    
{
 name
:

'Runway'
,
 description
:

'Runway video generation optimization'

}
,

    
{
 name
:

'Veo'
,
 description
:

'Google Veo video generation optimization'

}
,

    
{
 name
:

'Sora'
,
 description
:

'OpenAI Sora video generation optimization'

}
,

    
{
 name
:

'Universal'
,
 description
:

'General purpose prompt optimization'

}
,

  
]
;

  
for

(
const
 plat 
of
 platforms
)

{

    
await
 prisma
.
aIPlatform
.
upsert
(
{

      where
:

{
 slug
:

slugify
(
plat
.
name
,

{
 lower
:

true

}
)

}
,

      update
:

{
}
,

      create
:

{

        name
:
 plat
.
name
,

        slug
:

slugify
(
plat
.
name
,

{
 lower
:

true

}
)
,

        description
:
 plat
.
description
,

        active
:

true
,

      
}
,

    
}
)
;

  
}

  
console
.
log
(
'Platforms seeded'
)
;

  
// Seed Subscription Plans

  
const
 plans 
=

[

    
{
 name
:

'Free'
,
 slug
:

'free'
,
 price
:

0
,
 monthlyPromptLimit
:

50
,
 maxPromptVersions
:

3
,
 maxFolders
:

3
,
 maxTags
:

10

}
,

    
{
 name
:

'Pro'
,
 slug
:

'pro'
,
 price
:

19
,
 monthlyPromptLimit
:

500
,
 maxPromptVersions
:

10
,
 maxFolders
:

20
,
 maxTags
:

100

}
,

    
{
 name
:

'Business'
,
 slug
:

'business'
,
 price
:

49
,
 monthlyPromptLimit
:

5000
,
 maxPromptVersions
:

50
,
 maxFolders
:

100
,
 maxTags
:

500

}
,

  
]
;

  
for

(
const
 plan 
of
 plans
)

{

    
await
 prisma
.
subscriptionPlan
.
upsert
(
{

      where
:

{
 slug
:
 plan
.
slug 
}
,

      update
:

{
}
,

      create
:
 plan
,

    
}
)
;

  
}

  
console
.
log
(
'Subscription plans seeded'
)
;

  
// Create initial Super Admin if credentials are provided and no super admin exists

  
const
 adminUsername 
=
 process
.
env
.
ADMIN_USERNAME
;

  
const
 adminEmail 
=
 process
.
env
.
ADMIN_EMAIL
;

  
const
 adminPassword 
=
 process
.
env
.
ADMIN_INITIAL_PASSWORD
;

  
if

(
adminEmail 
&&
 adminPassword
)

{

    
const
 existingSuperAdmin 
=

await
 prisma
.
user
.
findFirst
(
{

      where
:

{
 role
:
 Role
.
SUPER_ADMIN

}
,

    
}
)
;

    
if

(
!
existingSuperAdmin
)

{

      
const
 hashedPassword 
=

await
 bcrypt
.
hash
(
adminPassword
,

12
)
;

      
await
 prisma
.
user
.
create
(
{

        data
:

{

          name
:
 adminUsername 
||

'Super Admin'
,

          email
:
 adminEmail
.
toLowerCase
(
)
,

          password
:
 hashedPassword
,

          role
:
 Role
.
SUPER_ADMIN
,

          status
:
 AccountStatus
.
ACTIVE
,

          subscriptionPlan
:

'BUSINESS'
,

          subscriptionStatus
:

'ACTIVE'
,

          emailVerified
:

new

Date
(
)
,

        
}
,

      
}
)
;

      
console
.
log
(
'Initial Super Admin created'
)
;

    
}

else

{

      
console
.
log
(
'Super Admin already exists, skipping creation'
)
;

    
}

  
}

  
console
.
log
(
'Database seed completed'
)
;

}

main
(
)

  
.
catch
(
(
e
)

=>

{

    
console
.
error
(
'Seed error:'
,
 e
)
;

    process
.
exit
(
1
)
;

  
}
)

  
.
finally
(
async

(
)

=>

{

    
await
 prisma
.
$disconnect
(
)
;

  
}
)
;
