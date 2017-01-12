---
layout: post
title: "Slight of hand IClientMessageInspector"
date: 2017-01-12 +1100
comments: false
categories: ['wcf','iclientmessageinspector']
---

Recently I had the need to implement generic code that could take an XML message transform it using XSL and then POST the result to a WCF end point. In the course of researching and performing proof of concepts one approach I tried was to create a client proxy and rewrite the message before the POST occured. I did not end up using this approach but wanted to document what I did.

```
    public class TrickySoapMessageInspector : IClientMessageInspector
    {
        private readonly string _newSoapAction;

        public TrickySoapMessageInspector(string oldSoapAction, string newSoapAction)
        {
            _oldSoapAction = oldSoapAction;
            _newSoapAction = newSoapAction;
        }

        public object BeforeSendRequest(ref Message request, IClientChannel channel)
        {
            string action = request.Headers.GetHeader<string>("Action", request.Headers[0].Namespace);
            
            if (action.Contains("SendXml"))
            {
                request.Headers.Action = request.Headers.Action = _soapAction;

                var doc = LoadMessageXml(request);

                ChangeMessage(doc);

                var reader = LoadMessageXml(doc);
                
                request = Message.CreateMessage(reader, int.MaxValue, request.Version);
            }

            return null;
        }

        public void AfterReceiveReply(ref Message reply, object correlationState)
        {
        }

        private XmlDocument LoadMessageXml(Message request)
        {
            var ms = new MemoryStream();

            using (var writer = XmlWriter.Create(ms))
            {
                request.WriteMessage(writer);
                writer.Flush();
                ms.Position = 0;
            }

            var doc = new XmlDocument();
            doc.Load(ms);

            return doc;
        }

        private XmlReader LoadMessageXml(XmlDocument document)
        {
            var ms = new MemoryStream();

            using (var writer = XmlWriter.Create(ms))
            {
                document.WriteTo(writer);
                writer.Flush();
                ms.Position = 0;
            }
            
            return XmlReader.Create(ms);
        }

        private void ChangeMessage(XmlDocument doc)
        {
            var node = doc.SelectSingleNode("descendant::*[local-name()='SendXml']");
            
            if (node != null && node.ParentNode != null)
            {
                var fragment = doc.CreateDocumentFragment();
                fragment.InnerXml = node.InnerText;

                node.ParentNode.ReplaceChild(fragment, node);
            }
        }
    }
```

