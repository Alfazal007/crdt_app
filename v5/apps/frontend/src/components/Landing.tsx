import { Button } from "@/components/ui/button"
import { FileText, Users, Cloud, Edit } from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">DocEditor</span>
                        </div>
                        <nav className="flex items-center space-x-4">
                            <Link to="/signin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                                Sign in
                            </Link>
                            <Link to="/signup">
                                <Button className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center py-20">
                    <h1 className="text-4xl sm:text-6xl font-light text-gray-900 mb-6">Create and collaborate</h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Write, edit, and share documents online. Work together in real-time from anywhere in the world.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                                Get started for free
                            </Button>
                        </Link>
                        <Link to="/signin">
                            <Button variant="outline" size="lg" className="px-8">
                                Sign in to your account
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="py-16 border-t border-gray-100">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Edit className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Editing</h3>
                            <p className="text-gray-600">
                                Intuitive editing tools that make writing and formatting documents simple and fast.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Collaboration</h3>
                            <p className="text-gray-600">Work together with your team in real-time. See changes as they happen.</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Cloud className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Cloud Storage</h3>
                            <p className="text-gray-600">
                                Access your documents from anywhere. Everything is automatically saved to the cloud.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="py-16 text-center border-t border-gray-100">
                    <h2 className="text-3xl font-light text-gray-900 mb-4">Ready to get started?</h2>
                    <p className="text-gray-600 mb-8">Join thousands of users who trust DocEditor for their document needs.</p>
                    <Link to="/signup">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                            Create your first document
                        </Button>
                    </Link>
                </div>
            </main>

            <footer className="border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <span className="ml-2 text-lg font-semibold text-gray-900">DocEditor</span>
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-600">
                            <Link to="#" className="hover:text-gray-900">
                                Privacy
                            </Link>
                            <Link to="#" className="hover:text-gray-900">
                                Terms
                            </Link>
                            <Link to="#" className="hover:text-gray-900">
                                Help
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
