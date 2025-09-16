import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, Lock, Eye, FileText, AlertTriangle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const Datenschutz = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
                <span className="text-primary">Privacy Policy</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Datenschutzerklärung gemäß DSGVO
              </p>
            </div>

            <div className="space-y-8">
              {/* Responsible Service Provider */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-primary" />
                    Responsible Service Provider
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Responsible service provider in the sense of § 5 TMG
                  </p>
                </CardContent>
              </Card>

              {/* Data Protection at a Glance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-primary" />
                    Data Protection at a Glance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">General Information</h3>
                    <p className="text-muted-foreground mb-4">
                      The following notices provide a simple overview of what happens to your personal data when you visit this website. Personal data is any data by which you can be personally identified. For more detailed information on data protection, please refer to our privacy policy listed below this text.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Data Collection on This Website</h3>
                    <p className="text-muted-foreground mb-4">
                      <strong>Who is responsible for data collection on this website?</strong><br />
                      Data processing on this website is carried out by the website operator. You can find the contact details of the website operator in the section "Information on the data controller" in this privacy policy.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">How do we collect your data?</h3>
                    <p className="text-muted-foreground mb-4">
                      On the one hand, your data is collected by you providing it to us. This may, for example, be data that you enter in a contact form.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Other data is collected automatically or with your consent by our IT systems when you visit the website. This is mainly technical data (e.g. internet browser, operating system or time of page access). This data is collected automatically as soon as you enter this website.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What do we use your data for?</h3>
                    <p className="text-muted-foreground mb-4">
                      Some of the data is collected in order to ensure error-free provision of the website. Other data may be used to analyse your user behaviour.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">What rights do you have regarding your data?</h3>
                    <p className="text-muted-foreground">
                      You have the right to receive information free of charge at any time about the origin, recipient and purpose of your stored personal data. You also have the right to request the correction or deletion of this data. If you have given your consent to data processing, you can revoke this consent at any time for the future. You also have the right to request the restriction of the processing of your personal data under certain circumstances. Furthermore, you have the right to lodge a complaint with the competent supervisory authority. You can contact us at any time about this and other questions on the subject of data protection.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Hosting */}
              <Card>
                <CardHeader>
                  <CardTitle>Hosting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">External Hosting</h3>
                    <p className="text-muted-foreground mb-4">
                      This website is hosted externally. The personal data collected on this website is stored on the servers of the hoster(s). This may include, but is not limited to, IP addresses, contact requests, meta and communication data, contractual data, contact details, names, website traffic and other data generated by a website.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      External hosting is carried out for the purpose of contract fulfilment vis-à-vis our potential and existing customers (Art. 6 para. 1 lit. b DSGVO) and in the interest of a secure, fast and efficient provision of our online offer by a professional provider (Art. 6 para. 1 lit. f DSGVO).
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Our hoster(s) will only process your data insofar as this is necessary for the fulfilment of their service obligations and follow our instructions with regard to this data.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      <strong>We use the following hoster(s):</strong><br />
                      Hostpress GmbH<br />
                      Bahnhofstrasse 34<br />
                      66571 Eppelborn
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Order Processing</h3>
                    <p className="text-muted-foreground">
                      We have concluded a contract on order processing (AVV) for the use of the above-mentioned service. This is a contract required by data protection law, which ensures that this service only processes the personal data of our website visitors in accordance with our instructions and in compliance with the GDPR.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* General Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    General Notes and Mandatory Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Data Protection</h3>
                    <p className="text-muted-foreground mb-4">
                      The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this data protection declaration.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      When you use this website, various personal data are collected. Personal data is data by which you can be personally identified. This Privacy Policy explains what information we collect and how we use it. It also explains how and for what purpose this is done.
                    </p>
                    <p className="text-muted-foreground mb-4">
                      We would like to point out that data transmission on the Internet (e.g. when communicating by e-mail) can have security gaps. Complete protection of data against access by third parties is not possible.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Note on the Responsible Office</h3>
                    <p className="text-muted-foreground mb-4">
                      The responsible party for data processing on this website is:
                    </p>
                    <p className="text-muted-foreground mb-4">
                      hej consulting GmbH<br />
                      Herzogstrasse 19<br />
                      80803 München<br />
                      Tel: +49 89 9017 6218<br />
                      Email: kontakt@hejcompany.de
                    </p>
                    <p className="text-muted-foreground">
                      The controller is the natural or legal person who alone or jointly with others determines the purposes and means of the processing of personal data (e.g. names, e-mail addresses or similar).
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Data Rights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                    Your Data Rights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Right to Object</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      IF DATA PROCESSING IS CARRIED OUT ON THE BASIS OF ART. 6 ABS. 1 LIT. E OR F DSGVO, YOU HAVE THE RIGHT TO OBJECT TO THE PROCESSING OF YOUR PERSONAL DATA AT ANY TIME FOR REASONS ARISING FROM YOUR PARTICULAR SITUATION; THIS ALSO APPLIES TO PROFILING BASED ON THESE PROVISIONS.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Right of Appeal</h3>
                    <p className="text-muted-foreground mb-4">
                      In the event of breaches of the GDPR, data subjects shall have a right of appeal to a supervisory authority, in particular in the Member State of their habitual residence, their place of work or the place of the alleged breach.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Right to Data Portability</h3>
                    <p className="text-muted-foreground mb-4">
                      You have the right to have data that we process automatically on the basis of your consent or in fulfilment of a contract handed over to you or to a third party in a common, machine-readable format.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Information, Deletion and Correction</h3>
                    <p className="text-muted-foreground mb-4">
                      Within the framework of the applicable legal provisions, you have the right at any time to free information about your stored personal data, its origin and recipient and the purpose of the data processing and, if applicable, a right to correction or deletion of this data.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* SSL/TLS and Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="w-6 h-6 text-primary" />
                    SSL/TLS Encryption and Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">SSL or TLS Encryption</h3>
                    <p className="text-muted-foreground mb-4">
                      For security reasons and to protect the transmission of confidential content, such as orders or enquiries that you send to us as the site operator, this site uses SSL or TLS encryption. You can recognise an encrypted connection by the fact that the address line of the browser changes from "http://" to "https://" and by the lock symbol in your browser line.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Contact by E-mail</h3>
                    <p className="text-muted-foreground mb-4">
                      If you contact us via the e-mail address provided or other e-mail addresses of our company that are published on our website, we will store your e-mail address as well as other contact data within your e-mail in order to process your enquiry.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Contact Form</h3>
                    <p className="text-muted-foreground">
                      When contacting us via the contact form available on our website, your e-mail address and name as well as other contact data voluntarily provided by you will be stored and processed by us in order to process your request.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Source */}
              <Card>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Source: https://www.e-recht24.de
                  </p>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">Still Have Some Questions Left?</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">Call us</p>
                      <a 
                        href="tel:+498990176218" 
                        className="text-primary hover:text-primary-hover font-semibold transition-colors"
                      >
                        Tel: +49 89 9017 6218
                      </a>
                    </div>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Feel free to contact our support team to learn more about the services provided by us and multiple offers for Your business!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
};

export default Datenschutz;