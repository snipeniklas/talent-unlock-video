import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/i18n";
import { CheckCircle, Loader2 } from "lucide-react";
import { trackEvent } from "@/components/FacebookPixel";

const formSchema = z.object({
  companyName: z.string().min(2, "raasInquiry.validation.companyNameMin").max(100),
  firstName: z.string().min(2, "raasInquiry.validation.firstNameMin").max(50),
  lastName: z.string().min(2, "raasInquiry.validation.lastNameMin").max(50),
  email: z.string().email("raasInquiry.validation.emailInvalid").max(255),
  phone: z.string().min(5, "raasInquiry.validation.phoneMin").max(50),
  position: z.string().max(100).optional(),
  inquiry: z.string().min(10, "raasInquiry.validation.inquiryMin").max(2000, "raasInquiry.validation.inquiryMax"),
});

type FormData = z.infer<typeof formSchema>;

interface RaasInquiryDialogProps {
  trigger: React.ReactNode;
  source?: string;
}

export function RaasInquiryDialog({ 
  trigger, 
  source = "website" 
}: RaasInquiryDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      inquiry: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      let companyId: string | null = null;
      
      // 1. Check if company already exists by name (case-insensitive)
      const { data: existingCompany, error: searchError } = await supabase
        .from("crm_companies")
        .select("id")
        .ilike("name", data.companyName)
        .maybeSingle();
      
      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }
      
      if (existingCompany) {
        // Company exists, use existing ID
        companyId = existingCompany.id;
      } else {
        // 2. Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from("crm_companies")
          .insert({
            name: data.companyName,
            status: "prospect",
            email: data.email,
          })
          .select("id")
          .single();
        
        if (companyError) throw companyError;
        companyId = newCompany.id;
      }
      
      // 3. Insert contact with company reference
      const { error: contactError } = await supabase
        .from("crm_contacts")
        .insert({
          crm_company_id: companyId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          position: data.position || null,
          inquiry: data.inquiry,
          status: "new",
          priority: "high",
          lead_source: source,
          last_contact_date: new Date().toISOString(),
        });

      if (contactError) throw contactError;

      // Track Facebook Pixel event
      trackEvent("Lead", {
        content_name: "RaaS Inquiry",
        content_category: source,
        value: 0,
        currency: "EUR",
      });

      // Show success state
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      form.setError("root", {
        message: t("raasInquiry.error.message"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Track dialog open event
      trackEvent("ViewContent", {
        content_name: "RaaS Inquiry Form",
        content_category: source,
      });
      // Reset states when opening
      setIsSuccess(false);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl">
                {t("raasInquiry.success.title")}
              </DialogTitle>
              <DialogDescription className="text-base">
                {t("raasInquiry.success.message")}
              </DialogDescription>
            </DialogHeader>
            
            {/* Calendly CTA Section */}
            <div className="w-full max-w-md space-y-4 pt-4">
              <div className="text-center space-y-2">
                <p className="text-base font-medium">
                  📅 {t("raasInquiry.success.calendly.title")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("raasInquiry.success.calendly.description")}
                </p>
              </div>
              
              <Button 
                asChild
                size="lg" 
                className="w-full"
              >
                <a 
                  href="https://calendly.com/pascal-hejtalent/15min" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {t("raasInquiry.success.calendly.button")}
                </a>
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                {t("raasInquiry.success.calendly.optional")}
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("raasInquiry.title")}</DialogTitle>
              <DialogDescription>
                {t("raasInquiry.subtitle")}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("raasInquiry.fields.companyName")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder={t("raasInquiry.placeholders.companyName")}
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("raasInquiry.fields.firstName")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("raasInquiry.fields.lastName")}</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("raasInquiry.fields.email")}</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("raasInquiry.fields.phone")}</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("raasInquiry.fields.position")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inquiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("raasInquiry.fields.inquiry")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t("raasInquiry.placeholders.inquiry")}
                          className="min-h-[80px] resize-none"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("raasInquiry.submitting")}
                    </>
                  ) : (
                    t("raasInquiry.submit")
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
