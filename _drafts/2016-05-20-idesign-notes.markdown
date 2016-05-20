---
layout: post
title: "IDesign notes"
date: 2016-05-20 +1100
comments: false
categories: ['idesign']
---

Every class as a service; https://www.youtube.com/watch?v=w-Hxc6uWCPg



Monty's REST Playbook:
A team chooses API as their ubiquitous connectivity interaction mode
They start building services to serve the business
They realize a 4 verb haiku is insufficient to express their needs. They realize they’re jumping through hoops to make it work.
They then realize to properly express these activities they must abandon the default routing scheme and devise their own
They craft a Uri nomenclature that is action-based
They then realize the default JSON DTO expressions are not adequate
They realize message metadata has real value
But the programming model between HTTP headers and JSON DTOs is incongruous
They see they need a lot of boilerplate to make it fly. Not to mention the programming model on both sides of the wire is different.
They then realize that their message metadata needs don’t jive with stock HTTP key/value pair headers
To compensate, they craft JSON envelopes that look strangely like SOAP
Then a need from the business (aka the business agility slide) requires queueing and the Dev teams revolt.

A good article that covers some of the failings: https://dzone.com/articles/restful-considered-harmful Some of things I particularly like from the article are "CRUD by definition" and "HTTP Verbs aren't descriptive enough".

Other thoughts:
WCF is old: so is COM, it doesn't stop Windows from running on it. E.g. All the new WinRT APIs use COM under the covers.
WCF is complex: this one is true to a degree, which is why you apply some iFX on top of it. See Monty's Building Microservices in .NET presentation and code which applies convention and policy to remove the need for complex configuration. Also covered in his WCF is dead long live WCF presentation.
Everything in WCF possible in WebAPI:
Try creating APIs that use the verbs of your business.
Try extending WebAPI to automatically inject ambient contexts as message metadata.
