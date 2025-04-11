import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-neutral-100 py-6 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-accent">Intellimed AI</h1>
            <p className="text-neutral-500">Medical Documentation Assistant</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary-dark">
            <Link href="/soap-notes">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-12 px-4">
        <section className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-neutral-800">Transform Medical Documentation with AI</h2>
          <p className="text-xl text-neutral-600 mb-8">
            Intellimed AI listens to doctor-patient conversations and generates accurate, 
            customizable SOAP notes with specialized medical documentation assistance.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary-dark">
            <Link href="/soap-notes">
              Get Started Now
            </Link>
          </Button>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <span className="material-icons text-primary text-3xl">record_voice_over</span>
              <CardTitle className="mt-2">Record Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Easily record or upload doctor-patient conversations for instant transcription.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="material-icons text-primary text-3xl">description</span>
              <CardTitle className="mt-2">Generate SOAP Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Automatically create comprehensive, structured SOAP notes from conversations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="material-icons text-primary text-3xl">edit_note</span>
              <CardTitle className="mt-2">Customizable Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Edit and customize generated notes to match your specific requirements.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="material-icons text-primary text-3xl">psychology</span>
              <CardTitle className="mt-2">Specialized Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600">
                Add chart summaries, clinical guideline checks, and CPT/ICD-10 code generation.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-neutral-800">Ready to Streamline Your Documentation?</h2>
          <p className="text-lg text-neutral-600 mb-8">
            Join healthcare professionals who save hours every day with Intellimed AI.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent-dark">
            <Link href="/soap-notes">
              Launch Intellimed AI
            </Link>
          </Button>
        </section>
      </main>

      <footer className="bg-white border-t border-neutral-100 py-6 px-4">
        <div className="container mx-auto text-center text-neutral-500 text-sm">
          <p>© 2024 Intellimed AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
